pub mod background;
pub mod commands;
pub mod download;
pub mod events;
pub mod monitor;
pub mod streams;

use download::DownloadParam;
use futures::stream::Stream;
use serde::{Deserialize, Serialize};
use streams::{PHandle, PDesc};
use tauri::Emitter;
use tokio::time::Duration;
use events::TauriEventSink;

#[derive(Serialize, Deserialize, Clone, Hash, PartialEq, Eq)]
pub enum PTaskType {
  Download,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PTaskPayload {
  pub task_type: PTaskType,
  pub task_param: PTaskParam,
}

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
