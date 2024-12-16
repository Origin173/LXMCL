use crate::{storage::Storage, EXE_DIR};

use super::models::Player;
use std::path::PathBuf;

impl Storage for Vec<Player> {
  fn file_path() -> PathBuf {
    EXE_DIR.join("sjmcl.account.json")
  }
}
