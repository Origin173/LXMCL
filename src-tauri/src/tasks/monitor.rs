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
use std::sync::RwLock;
use std::vec::Vec;
use tauri::AppHandle;
use tokio::sync::Semaphore;

#[derive(Serialize, Deserialize, Clone, PartialEq)]
pub enum ProgressState {
  Stopped,
  Completed,
  Cancelled,
  InProgress,
}

type SJMCLBoxedFuture = Pin<Box<dyn Future<Output = SJMCLResult<u32>> + Send>>;

pub struct ProgressiveTaskMonitor {
  app_handle: AppHandle,
  id_counter: AtomicU32,
  p_descs: RwLock<HashMap<u32, Arc<Mutex<ProgressiveTaskDescriptor>>>>,
  concurrency: Arc<Semaphore>,
  tx: FlumeSender<SJMCLBoxedFuture>,
  rx: FlumeReceiver<SJMCLBoxedFuture>,
  pub download_rate_limiter: Option<DefaultDirectRateLimiter>,
}

impl ProgressiveTaskMonitor {
  pub fn new(app_handle: AppHandle) -> Self {
    let config = retrieve_launcher_config(app_handle.clone()).unwrap();
    let (tx, rx) = flume::unbounded();
    ProgressiveTaskMonitor {
      app_handle: app_handle.clone(),
      id_counter: AtomicU32::new(0),
      p_descs: RwLock::new(HashMap::new()),
      concurrency: Arc::new(Semaphore::new(
        if config.download.transmission.auto_concurrent {
          let parallelism: usize = std::thread::available_parallelism().unwrap().into();
          1 + (parallelism / 2_usize)
        } else {
          config.download.transmission.concurrent_count
        },
      )),
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
    task_state: Option<Arc<Mutex<ProgressiveTaskDescriptor>>>,
  ) where
    T: Future<Output = SJMCLResult<()>> + Send + 'static,
  {
    let handle = self.app_handle.clone();
    let state = if let Some(state) = task_state {
      state
    } else {
      unimplemented!()
    };

    self.p_descs.write().unwrap().insert(id, state.clone());
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
  }

  pub async fn background_process(&self) {
    loop {
      let task = self.rx.recv_async().await.unwrap();
      if self.concurrency.acquire().await.is_ok() {
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
    if let Some(state) = self.p_descs.write().unwrap().get_mut(&id) {
      state.lock().unwrap().stop();
    }
  }

  pub fn resume_progress(&self, id: u32) {
    if let Some(state) = self.p_descs.write().unwrap().get_mut(&id) {
      state.lock().unwrap().resume();
    }
  }

  pub fn cancel_progress(&self, id: u32) {
    if let Some(state) = self.p_descs.write().unwrap().get_mut(&id) {
      state.lock().unwrap().cancel()
    }
  }

  pub fn state_list(&self) -> Vec<ProgressiveTaskDescriptor> {
    self
      .p_descs
      .read()
      .unwrap()
      .values()
      .map(|v| v.lock().unwrap().clone())
      .collect()
  }
}
