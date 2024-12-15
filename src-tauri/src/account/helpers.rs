use super::models::Player;
use serde_json;
use std::{fs, path::PathBuf, sync::LazyLock};

static ACCOUNT_PATH: LazyLock<PathBuf> = LazyLock::new(|| {
  std::env::current_exe()
    .unwrap()
    .parent()
    .unwrap()
    .join("sjmcl.account.json")
});

pub fn read_or_empty() -> Vec<Player> {
  if let Ok(accounts_str) = fs::read_to_string(ACCOUNT_PATH.as_path()) {
    serde_json::from_str::<Vec<Player>>(&accounts_str).unwrap()
  } else {
    vec![]
  }
}

pub fn save_accounts(accounts: Vec<Player>) {
  let accounts_str = serde_json::to_string_pretty(&accounts).unwrap();
  fs::write(ACCOUNT_PATH.as_path(), accounts_str).unwrap();
}
