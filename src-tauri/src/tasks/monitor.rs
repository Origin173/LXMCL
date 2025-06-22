use crate::error::SJMCLResult;
use crate::launcher_config::commands::retrieve_launcher_config;

use async_speed_limit::Limiter;
use download::DownloadTask;
use flume::{Receiver as FlumeReceiver, Sender as FlumeSender};
use glob::glob;
use log::info;
use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use std::sync::atomic::AtomicU32;
use std::sync::{Arc, RwLock};
use std::vec::Vec;
use tauri::AppHandle;
use tokio::sync::Semaphore;

use super::events::TEvent;
use super::*;

type SJMCLBoxedFuture = Pin<Box<dyn Future<Output = SJMCLResult<u32>> + Send>>;
pub struct TaskMonitor {
  app_handle: AppHandle,
  id_counter: AtomicU32,
  phs: RwLock<HashMap<u32, Arc<RwLock<PTaskHandle>>>>,
  ths: RwLock<HashMap<u32, THandle>>,
  concurrency: Arc<Semaphore>,
  tx: FlumeSender<SJMCLBoxedFuture>,
  rx: FlumeReceiver<SJMCLBoxedFuture>,
  pub download_rate_limiter: Option<Limiter>,
}

impl TaskMonitor {
  pub fn new(app_handle: AppHandle) -> Self {
    let config = retrieve_launcher_config(app_handle.clone()).unwrap();
    let (tx, rx) = flume::unbounded();
    TaskMonitor {
      app_handle: app_handle.clone(),
      id_counter: AtomicU32::new(0),
      phs: RwLock::new(HashMap::new()),
      ths: RwLock::new(HashMap::new()),
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
        Some(Limiter::new(
          (config.download.transmission.speed_limit_value as i64 * 1024) as f64,
        ))
      } else {
        None
      },
    }
  }

  #[allow(clippy::manual_flatten)]
  pub async fn load_saved_tasks(&self) {
    let cache_dir = retrieve_launcher_config(self.app_handle.clone())
      .unwrap()
      .download
      .cache
      .directory;

    for entry in glob(&format!(
      "{}/descriptors/task_*.json",
      cache_dir.to_str().unwrap()
    ))
    .unwrap()
    {
      if let Ok(task) = entry {
        match PTaskDesc::load(&task.clone()) {
          Ok(desc) => {
            let task_id = desc.task_id;
            let task_group = desc.task_group.clone();
            match desc.payload.task_type {
              PTaskType::Download => {
                let task = DownloadTask::from_descriptor(
                  self.app_handle.clone(),
                  desc,
                  Duration::from_secs(1),
                );
                let (f, p_handle) = task
                  .future(self.app_handle.clone(), self.download_rate_limiter.clone())
                  .await
                  .unwrap();
                self.enqueue_task(task_id, task_group, f, p_handle).await;
              }
            }
          }
          Err(_) => {
            info!("Failed to load task descriptor: {}", task.display());
          }
        }
      }
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
    p_handle: Arc<RwLock<PTaskHandle>>,
  ) where
    T: Future<Output = SJMCLResult<()>> + Send + 'static,
  {
    self.phs.write().unwrap().insert(id, p_handle.clone());

    let task = Box::pin(async move {
      if p_handle.read().unwrap().desc.state.is_cancelled() {
        return Ok(id);
      }

      let result = task.await;
      let mut p_handle = p_handle.write().unwrap();

      if let Err(e) = result {
        p_handle.mark_failed(e.0);
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
    if let Some(handle) = self.phs.read().unwrap().get(&id) {
      handle.write().unwrap().mark_stopped();
    }
  }

  pub fn resume_progress(&self, id: u32) {
    if let Some(handle) = self.phs.read().unwrap().get(&id) {
      handle.write().unwrap().mark_resumed();
    }
  }

  pub fn cancel_progress(&self, id: u32) {
    if let Some(handle) = self.phs.read().unwrap().get(&id) {
      handle.write().unwrap().mark_cancelled()
    }
  }

  pub fn create_transient_task(&self, app: AppHandle, mut handle: THandle) {
    handle.task_id = self.get_new_id();
    TEvent::new(&handle).emit(&app);
    self.ths.write().unwrap().insert(handle.task_id, handle);
  }

  pub fn set_transient_task(&self, app: AppHandle, task_id: u32, state: String) {
    if let Some(desc) = self.ths.write().unwrap().get_mut(&task_id) {
      desc.state = state;
      TEvent::new(desc).emit(&app);
    }
  }

  pub fn cancel_transient_task(&self, task_id: u32) {
    self.ths.write().unwrap().remove(&task_id);
  }

  pub fn get_transient_task(&self, task_id: u32) -> Option<THandle> {
    self.ths.read().unwrap().get(&task_id).cloned()
  }

  pub fn state_list(&self) -> Vec<PTaskDesc> {
    self
      .phs
      .read()
      .unwrap()
      .values()
      .map(|v| v.read().unwrap().desc.clone())
      .collect()
  }
}
