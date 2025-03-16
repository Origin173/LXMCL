use crate::error::SJMCLResult;
use crate::launcher_config::commands::retrieve_launcher_config;
use crate::tasks::*;
use flume::{Receiver as FlumeReceiver, Sender as FlumeSender};
use governor::{DefaultDirectRateLimiter, Quota, RateLimiter};
use log::info;
use std::collections::HashMap;
use std::future::Future;
use std::num::NonZero;
use std::pin::Pin;
use std::sync::atomic::AtomicU32;
use std::vec::Vec;
use tauri::AppHandle;
use tokio::sync::{Notify, Semaphore};

#[derive(Serialize, Deserialize, Clone, PartialEq)]
pub enum MonitorState {
  Stopped,
  Completed,
  Cancelled,
  InProgress,
}

type SJMCLBoxedFuture = Pin<Box<dyn Future<Output = SJMCLResult<u32>> + Send>>;

pub struct TaskMonitor {
  handle: AppHandle,
  id_counter: AtomicU32,
  states: Mutex<HashMap<u32, Arc<Mutex<TaskState>>>>,
  concurrency: Arc<Semaphore>,
  notify: Arc<Notify>,
  tx: FlumeSender<SJMCLBoxedFuture>,
  rx: FlumeReceiver<SJMCLBoxedFuture>,
  pub download_rate_limiter: Option<DefaultDirectRateLimiter>,
}

impl TaskMonitor {
  pub fn new(handle: AppHandle, notify: Arc<Notify>) -> Self {
    let config = retrieve_launcher_config(handle.clone()).unwrap();
    let (tx, rx) = flume::unbounded();
    TaskMonitor {
      handle: handle.clone(),
      id_counter: AtomicU32::new(0),
      states: Mutex::new(HashMap::new()),
      concurrency: Arc::new(Semaphore::new(
        if config.download.transmission.auto_concurrent {
          let parallelism: usize = std::thread::available_parallelism().unwrap().into();
          1 + (parallelism / 2_usize)
        } else {
          config.download.transmission.concurrent_count
        },
      )),
      notify,
      tx,
      rx,
      download_rate_limiter: if config.download.transmission.enable_speed_limit {
        Some(RateLimiter::direct(Quota::per_second(
          NonZero::new(config.download.transmission.speed_limit_value as u32).unwrap(),
        )))
      } else {
        None
      },
    }
  }

  pub fn get_new_id(&self) -> u32 {
    self
      .id_counter
      .fetch_add(1, std::sync::atomic::Ordering::SeqCst)
  }

  pub async fn enqueue_task<T>(
    &self,
    id: u32,
    task_group: Option<String>,
    task: T,
    task_state: Option<Arc<Mutex<TaskState>>>,
  ) where
    T: Future<Output = SJMCLResult<()>> + Send + 'static,
  {
    let handle = self.handle.clone();
    let state = if let Some(state) = task_state {
      state
    } else {
      unimplemented!()
    };

    self.states.lock().unwrap().insert(id, state.clone());
    TaskEvent::emit_created(&handle, id, task_group.clone().as_deref());

    let task = Box::pin(async move {
      if state.lock().unwrap().is_cancelled() {
        return Ok(id);
      }

      let result = task.await;
      let state = state.lock().unwrap();

      if let Err(e) = result {
        TaskEvent::emit_failed(&handle, id, state.task_group.as_deref(), e.0.clone());
      }

      if state.is_cancelled() {
        TaskEvent::emit_cancelled(&handle, id, state.task_group.as_deref());
      } else if state.is_completed() {
        TaskEvent::emit_completed(&handle, id, state.task_group.as_deref());
        state.delete().unwrap();
      }
      Ok(id)
    });

    self.tx.send_async(task).await.unwrap();
    self.notify.notify_one();
  }

  pub async fn background_process(&self) {
    loop {
      if self.rx.is_empty() {
        self.notify.notified().await;
      }

      if self.concurrency.acquire().await.is_ok() {
        let task = self.rx.recv_async().await.unwrap();
        let concurrency = self.concurrency.clone();
        tokio::spawn(async move {
          let r = task.await;
          match r {
            Ok(id) => {
              info!("Task {:?} completed", id);
            }
            Err(e) => {
              info!("Task failed: {:?}", e);
            }
          }
          concurrency.add_permits(1);
        });
      }
    }
  }

  pub fn stop_progress(&self, id: u32) {
    if let Some(state) = self.states.lock().unwrap().get_mut(&id) {
      state.lock().unwrap().stop();
    }
  }

  pub fn resume_progress(&self, id: u32) {
    if let Some(state) = self.states.lock().unwrap().get_mut(&id) {
      state.lock().unwrap().resume();
    }
  }

  pub fn cancel_progress(&self, id: u32) {
    if let Some(state) = self.states.lock().unwrap().get_mut(&id) {
      state.lock().unwrap().cancel()
    }
  }

  pub fn state_list(&self) -> Vec<TaskState> {
    self
      .states
      .lock()
      .unwrap()
      .values()
      .map(|v| v.lock().unwrap().clone())
      .collect()
  }
}
