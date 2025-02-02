use tauri::AppHandle;

use crate::{storage::Storage, EXE_DIR};

use super::models::LauncherConfig;
use std::path::PathBuf;

impl Storage for LauncherConfig {
  fn file_path() -> PathBuf {
    EXE_DIR.join("sjmcl.conf.json")
  }
}

pub fn get_app_version(app: AppHandle) -> String {
  let version = if cfg!(debug_assertions) {
    "dev".to_string()
  } else {
    app.package_info().version.to_string()
  };
  version
}
