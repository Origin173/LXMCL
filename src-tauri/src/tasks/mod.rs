use crate::tasks::monitor::ProgressState;
use download::DownloadParam;
use futures::stream::FusedStream;
use futures::stream::Stream;
use pin_project::pin_project;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll};
use tauri::{AppHandle, Emitter};
use tokio::time::{interval, Duration, Interval};
use tokio_util::bytes::Bytes;

pub mod background;
pub mod commands;
pub mod download;
pub mod monitor;

const TASK_PROGRESS_LISTENER: &str = "SJMCL://task-progress";

#[derive(Serialize, Deserialize, Clone)]
pub enum TaskEventPayload {
  Created,
  Started {
    total: i64,
  },
  InProgress {
    percent: f64,
    current: i64,
    estimated_time: Option<Duration>,
  },
  Completed,
  Stopped,
  Failed {
    reason: String,
  },
  Cancelled,
}

#[derive(Serialize, Clone)]
pub struct TaskEvent<'a> {
  pub id: u32,
  pub task_group: Option<&'a str>,
  pub event: TaskEventPayload,
}

impl<'a> TaskEvent<'a> {
  pub fn emit(self, app: &AppHandle) {
    if let Some(tg) = self.task_group {
      app.emit_to(TASK_PROGRESS_LISTENER, tg, self).unwrap();
    } else {
      app
        .emit_to(
          TASK_PROGRESS_LISTENER,
          std::format!("task-{}", self.id).as_str(),
          self,
        )
        .unwrap();
    }
  }

  pub fn emit_started(app: &AppHandle, id: u32, task_group: Option<&'a str>, total: i64) {
    TaskEvent {
      id,
      task_group,
      event: TaskEventPayload::Started { total },
    }
    .emit(app);
  }

  pub fn emit_failed(app: &AppHandle, id: u32, task_group: Option<&'a str>, reason: String) {
    TaskEvent {
      id,
      task_group,
      event: TaskEventPayload::Failed { reason },
    }
    .emit(app);
  }

  pub fn emit_cancelled(app: &AppHandle, id: u32, task_group: Option<&'a str>) {
    TaskEvent {
      id,
      task_group,
      event: TaskEventPayload::Cancelled,
    }
    .emit(app);
  }
  pub fn emit_completed(app: &AppHandle, id: u32, task_group: Option<&'a str>) {
    TaskEvent {
      id,
      task_group,
      event: TaskEventPayload::Completed,
    }
    .emit(app);
  }
  pub fn emit_created(app: &AppHandle, id: u32, task_group: Option<&'a str>) {
    TaskEvent {
      id,
      task_group,
      event: TaskEventPayload::Created,
    }
    .emit(app);
  }

  pub fn emit_in_progress(
    app: &AppHandle,
    id: u32,
    task_group: Option<&'a str>,
    percent: f64,
    current: i64,
    estimated_time: Option<Duration>,
  ) {
    TaskEvent {
      id,
      task_group,
      event: TaskEventPayload::InProgress {
        percent,
        current,
        estimated_time,
      },
    }
    .emit(app);
  }
}

#[derive(Serialize, Deserialize, Clone, Hash, PartialEq, Eq)]
pub enum ActiveTaskType {
  Download,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ProgressiveTaskDescriptor {
  pub task_id: u32,
  pub task_group: Option<String>,
  pub task_type: ActiveTaskType,
  pub current: i64,
  pub total: i64,
  #[serde(skip)]
  pub store_path: PathBuf,
  pub task_param: ActiveTaskState,
  pub state: ProgressState,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TransientTaskDescriptor {
  pub task_id: u32,
  pub task_group: Option<String>,
  pub state: String,
}

impl ProgressiveTaskDescriptor {
  pub fn new(
    task_id: u32,
    task_group: Option<String>,
    task_type: ActiveTaskType,
    total: i64,
    cache_dir: PathBuf,
    task_param: ActiveTaskState,
    monitor_state: ProgressState,
  ) -> Self {
    Self {
      task_id,
      task_group,
      task_type,
      current: 0,
      total,
      store_path: cache_dir.join(std::format!("states/task-{}.json", task_id)),
      task_param,
      state: monitor_state,
    }
  }

  pub fn load(filepath: PathBuf) -> Result<Self, std::io::Error> {
    let json_string = std::fs::read_to_string(&filepath)?;
    serde_json::from_str(&json_string)
      .map_err(|_| std::io::Error::new(std::io::ErrorKind::InvalidData, "Invalid JSON"))
  }

  pub fn save(&self) -> Result<(), std::io::Error> {
    let json_string = serde_json::to_string_pretty(self)?;
    std::fs::create_dir_all(self.store_path.parent().unwrap())?;
    std::fs::write(&self.store_path, json_string)
  }

  pub fn delete(&self) -> Result<(), std::io::Error> {
    std::fs::remove_file(&self.store_path)
  }

  #[inline]
  pub fn is_cancelled(&self) -> bool {
    self.state == ProgressState::Cancelled
  }

  #[inline]
  pub fn is_completed(&self) -> bool {
    self.state == ProgressState::Completed
  }

  #[inline]
  pub fn is_stopped(&self) -> bool {
    self.state == ProgressState::Stopped
  }

  #[inline]
  pub fn is_in_progress(&self) -> bool {
    self.state == ProgressState::InProgress
  }

  #[inline]
  pub fn cancel(&mut self) {
    self.state = ProgressState::Cancelled;
  }

  #[inline]
  pub fn stop(&mut self) {
    self.state = ProgressState::Stopped;
  }

  #[inline]
  pub fn mark_completed(&mut self) {
    self.state = ProgressState::Completed;
  }

  #[inline]
  pub fn resume(&mut self) {
    if self.state == ProgressState::Stopped {
      self.state = ProgressState::InProgress;
    }
  }
}

pub trait ProgressUnit {
  fn unit_size(&self) -> i64;
}

impl<T> ProgressUnit for &T {
  fn unit_size(&self) -> i64 {
    1
  }
}

impl ProgressUnit for Bytes {
  fn unit_size(&self) -> i64 {
    self.len() as i64
  }
}

impl<T, E> ProgressUnit for Result<T, E>
where
  T: ProgressUnit,
{
  fn unit_size(&self) -> i64 {
    match self {
      Ok(b) => (*b).unit_size(),
      Err(_) => 0,
    }
  }
}

impl<T> ProgressUnit for Option<T>
where
  T: ProgressUnit,
{
  fn unit_size(&self) -> i64 {
    match self {
      Some(b) => (*b).unit_size(),
      None => 0,
    }
  }
}

#[pin_project]
pub struct ProgressStream<S, T>
where
  S: Stream<Item = T>,
  T: ProgressUnit,
{
  app_handle: AppHandle,
  desc: Arc<Mutex<ProgressiveTaskDescriptor>>,
  #[pin]
  target: S,
  counter: i64,
  last_reported: i64,
  report_interval: Interval,
}

impl<S, T> ProgressStream<S, T>
where
  S: Stream<Item = T>,
  T: ProgressUnit,
{
  pub fn new(
    app_handle: AppHandle,
    target: S,
    descriptor: ProgressiveTaskDescriptor,
    report_interval: Duration,
  ) -> Self {
    let current = descriptor.current;
    Self {
      app_handle,
      target,
      desc: Arc::new(Mutex::new(descriptor)),
      counter: current,
      last_reported: 0,
      report_interval: interval(report_interval),
    }
  }
}

impl<S, T> Stream for ProgressStream<S, T>
where
  S: Stream<Item = T>,
  T: ProgressUnit,
{
  type Item = T;
  fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
    let p = self.project();

    if p.desc.lock().unwrap().is_stopped() {
      return Poll::Pending;
    }

    if !p.desc.lock().unwrap().is_in_progress() {
      return Poll::Ready(None);
    }

    p.target.poll_next(cx).map(|x| {
      if x.is_some() {
        *p.counter += x.unit_size();
        if p.report_interval.poll_tick(cx).is_ready() {
          let mut desc = p.desc.lock().unwrap();
          let current = *p.counter;
          let total = desc.total;
          let percent: f64 = (current as f64 / total as f64) * 100.0;
          desc.current += current - *p.last_reported;
          let estimated_time = if *p.last_reported > 0 {
            Some(
              p.report_interval
                .period()
                .mul_f64((total - current) as f64 / (current - *p.last_reported) as f64),
            )
          } else {
            None
          };
          *p.last_reported = current;
          TaskEvent::emit_in_progress(
            p.app_handle,
            desc.task_id,
            desc.task_group.as_deref(),
            percent,
            current,
            estimated_time,
          );
          desc.save().unwrap();
        }
      } else {
        p.desc.lock().unwrap().mark_completed()
      }
      x
    })
  }
}

impl<S, T> FusedStream for ProgressStream<S, T>
where
  S: Stream<Item = T>,
  T: ProgressUnit,
{
  fn is_terminated(&self) -> bool {
    let state = self.desc.lock().unwrap();
    state.is_cancelled() || state.is_completed()
  }
}

impl<S, T> ProgressStream<S, T>
where
  S: Stream<Item = T>,
  T: ProgressUnit,
{
  pub fn descriptor(&self) -> Arc<Mutex<ProgressiveTaskDescriptor>> {
    self.desc.clone()
  }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(tag = "task_type")]
pub enum ActiveTaskState {
  Download(DownloadParam),
}
