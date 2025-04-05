use crate::{
  account::models::{AccountError, AccountInfo, PlayerInfo},
  error::SJMCLResult,
  launcher_config::models::LauncherConfig,
};
use base64::{engine::general_purpose, Engine};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub fn get_selected_player_info_with_server_meta(
  app: &AppHandle,
) -> SJMCLResult<(PlayerInfo, String)> {
  let account_binding = app.state::<Mutex<AccountInfo>>();
  let account_state = account_binding.lock()?;

  let config_binding = app.state::<Mutex<LauncherConfig>>();
  let config_state = config_binding.lock()?;

  let selected_player_id = &config_state.states.shared.selected_player_id;
  if selected_player_id.is_empty() {
    return Err(AccountError::NotFound.into());
  }

  let player_info = account_state
    .players
    .iter()
    .find(|player| player.id == *selected_player_id)
    .ok_or(AccountError::NotFound)?;

  let auth_server = account_state
    .auth_servers
    .iter()
    .find(|server| server.auth_url == player_info.auth_server_url)
    .ok_or(AccountError::NotFound)?;

  Ok((
    player_info.clone(),
    general_purpose::STANDARD.encode(auth_server.metadata.to_string()),
  ))
}
