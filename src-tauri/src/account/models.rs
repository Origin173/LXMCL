use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

use crate::storage::Storage;

// only for the client
#[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Player {
  pub name: String,
  pub uuid: Uuid,
  pub avatar_src: String,
  pub player_type: String,
  #[serde(default)]
  pub auth_account: String,
  #[serde(default)]
  pub password: String,
  #[serde(default)]
  pub auth_server: AuthServer,
}

impl From<PlayerInfo> for Player {
  fn from(player_info: PlayerInfo) -> Self {
    let state: AccountInfo = Storage::load().unwrap_or_default();
    let auth_server = state
      .auth_servers
      .iter()
      .find(|server| server.auth_url == player_info.auth_server_url)
      .cloned()
      .unwrap_or_default();
    Player {
      name: player_info.name,
      uuid: player_info.uuid,
      avatar_src: player_info.avatar_src,
      player_type: player_info.player_type,
      auth_account: player_info.auth_account,
      password: player_info.password,
      auth_server,
    }
  }
}

// for backend storage, without saving the whole auth server info
#[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PlayerInfo {
  pub name: String,
  pub uuid: Uuid,
  pub avatar_src: String,
  pub player_type: String,
  pub auth_account: String,
  pub password: String,
  pub auth_server_url: String,
}

#[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AuthServer {
  pub name: String,
  pub auth_url: String,
  pub homepage_url: String,
  pub register_url: String,
}

#[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AccountInfo {
  pub players: Vec<PlayerInfo>,
  pub selected_player_id: String, // maybe "" if none of the player was selected
  pub auth_servers: Vec<AuthServer>,
}

#[derive(Debug)]
pub enum AuthServerError {
  DuplicateServer,
  InvalidServer,
  NotFound,
}

impl fmt::Display for AuthServerError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    match self {
      AuthServerError::DuplicateServer => write!(f, "DUPLICATE_SERVER"),
      AuthServerError::InvalidServer => write!(f, "INVALID_SERVER"),
      AuthServerError::NotFound => write!(f, "NOT_FOUND"),
    }
  }
}
