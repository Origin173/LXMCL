use serde::{de::DeserializeOwned, Serialize};
use std::fs;

use crate::error::SJMCLResult;

pub trait Storage {
  fn file_path() -> std::path::PathBuf;

  fn load() -> SJMCLResult<Self>
  where
    Self: Sized + DeserializeOwned,
  {
    let json_string = fs::read_to_string(Self::file_path())?;
    let value = serde_json::from_str(&json_string)?;
    Ok(value)
  }

  fn save(&self) -> SJMCLResult<()>
  where
    Self: Serialize,
  {
    let json_string = serde_json::to_string_pretty(self)?;
    fs::write(Self::file_path(), json_string)?;
    Ok(())
  }
}
