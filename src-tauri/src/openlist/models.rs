use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FsObject {
  pub id: String,
  pub path: String,
  pub name: String,
  pub size: u64,
  pub is_dir: bool,
  pub modified: String,
  pub created: String,
  pub sign: String,
  pub thumb: String,
  #[serde(rename = "type")]
  pub file_type: u8,
}
