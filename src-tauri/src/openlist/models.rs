/**
 * OpenList 数据模型
 * 与前端 TypeScript 类型保持一致
 */
use serde::{Deserialize, Serialize};

/// OpenList 文件对象（从前端传递）
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
