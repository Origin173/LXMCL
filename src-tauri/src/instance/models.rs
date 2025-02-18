use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::launcher_config::models::GameConfig;

structstruck::strike! {
  #[strikethrough[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize, Default)]]
  #[strikethrough[serde(rename_all = "camelCase", deny_unknown_fields)]]
  pub struct Instance {
    pub id: usize,
    pub name: String,
    pub description: String,
    pub icon_src: String,
    pub version: String,
    pub version_path: PathBuf,
    pub mod_loader: struct {
      pub loader_type: String,
      pub version: String,
    },
    pub has_schem_folder: bool,
    pub game_config: Option<GameConfig>, // TODO: any sub-config can be None?
  }
}

#[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct GameServerInfo {
  pub icon_src: String,
  pub ip: String,
  pub name: String,
  pub is_queried: bool, // if true, this is a complete result from a successful query
  pub players_online: usize,
  pub players_max: usize,
  pub online: bool, // if false, it may be offline in the query result or failed in the query.
}

#[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Screenshot {
  pub file_name: String,
  pub file_path: String,
  pub time: u64,
}
