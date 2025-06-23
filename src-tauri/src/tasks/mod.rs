pub mod background;
pub mod commands;
pub mod download;
pub mod events;
pub mod monitor;
pub mod streams;

use crate::error::SJMCLResult;
use download::DownloadParam;
use events::TauriEventSink;
use futures::stream::Stream;
use serde::{Deserialize, Serialize};
use std::future::Future;
use std::pin::Pin;
use streams::{PDesc, PHandle};
use tauri::{AppHandle, Emitter};
use tokio::time::Duration;

#[derive(Serialize, Deserialize, Clone, Hash, PartialEq, Eq)]
pub enum PTaskType {
  Download,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PTaskPayload {
  pub task_type: PTaskType,
  pub task_param: PTaskParam,
}

pub type SJMCLBoxedFuture = Pin<Box<dyn Future<Output = SJMCLResult<u32>> + Send>>;
pub type MonitorBoxedFuture = Pin<Box<dyn Future<Output = ()> + Send>>;
type PTaskHandle = PHandle<TauriEventSink, PTaskPayload>;
type PTaskDesc = PDesc<PTaskPayload>;

#[derive(Serialize, Deserialize, Clone)]
pub struct THandle {
  #[serde(default)]
  pub task_id: u32,
  pub task_group: Option<String>,
  pub task_type: String,
  pub state: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(tag = "task_type")]
pub enum PTaskParam {
  Download(DownloadParam),
}
