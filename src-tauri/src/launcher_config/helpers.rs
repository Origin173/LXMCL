use crate::{storage::Storage, EXE_DIR};

use super::models::LauncherConfig;
use std::path::PathBuf;

impl Storage for LauncherConfig {
  fn file_path() -> PathBuf {
    EXE_DIR.join("sjmcl.conf.json")
  }
}
