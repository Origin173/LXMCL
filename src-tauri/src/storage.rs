use std::fs;

use serde::{de::DeserializeOwned, Serialize};

#[derive(Debug, Serialize)]
pub enum StorageError {
  IoError(String),
  SerdeError(String),
}

impl From<std::io::Error> for StorageError {
  fn from(e: std::io::Error) -> Self {
    Self::IoError(e.to_string())
  }
}

impl From<serde_json::Error> for StorageError {
  fn from(e: serde_json::Error) -> Self {
    Self::SerdeError(e.to_string())
  }
}

pub trait Storage {
  fn file_path() -> std::path::PathBuf;

  fn load() -> Result<Self, StorageError>
  where
    Self: Sized + DeserializeOwned,
  {
    let json_string = fs::read_to_string(Self::file_path())?;
    let value = serde_json::from_str(&json_string)?;
    Ok(value)
  }

  fn save(&self) -> Result<(), StorageError>
  where
    Self: Serialize,
  {
    let json_string = serde_json::to_string_pretty(self)?;
    fs::write(Self::file_path(), json_string)?;
    Ok(())
  }
}
