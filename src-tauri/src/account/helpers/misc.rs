use crate::{
  account::models::{AccountError, AccountInfo, PlayerInfo, PlayerType},
  error::SJMCLResult,
  launcher_config::models::LauncherConfig,
  storage::Storage,
};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;

pub fn get_selected_player_info(app: &AppHandle) -> SJMCLResult<PlayerInfo> {
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

  Ok(player_info.clone())
}

async fn is_china_mainland_ip(app: &AppHandle) -> SJMCLResult<bool> {
  let client = app.state::<reqwest::Client>();

  // retrieve the real IP
  let resp = client
    .get("https://cloudflare.com/cdn-cgi/trace")
    .send()
    .await
    .map_err(|_| AccountError::NetworkError)?;

  let text = resp.text().await.map_err(|_| AccountError::NetworkError)?;

  let locale = text
    .split('\n')
    .find(|line| line.starts_with("loc="))
    .ok_or(AccountError::NetworkError)?;

  let country = locale.split('=').nth(1).ok_or(AccountError::NetworkError)?;

  Ok(country == "CN")
}

pub async fn check_full_login_availability(app: &AppHandle) -> SJMCLResult<()> {
  match is_china_mainland_ip(app).await {
    Ok(is_china) => {
      if is_china {
        // in China, offline login is always available
        let config_binding = app.state::<Mutex<LauncherConfig>>();
        let mut config_state = config_binding.lock()?;
        config_state.general.functionality.full_login = true;
        config_state.save()?;
      } else {
        // not in China, check if any Microsoft account has been added
        let account_binding = app.state::<Mutex<AccountInfo>>();
        let account_state = account_binding.lock().unwrap();

        let config_binding = app.state::<Mutex<LauncherConfig>>();
        let mut config_state = config_binding.lock()?;

        config_state.general.functionality.full_login = !account_state
          .players
          .iter()
          .filter(|player| player.player_type == PlayerType::Microsoft)
          .collect::<Vec<&PlayerInfo>>()
          .is_empty();

        config_state.save()?;
      }
    }
    Err(_) => {
      // if we cannot determine the IP, check if any account has been added
      let account_binding = app.state::<Mutex<AccountInfo>>();
      let account_state = account_binding.lock()?;

      let config_binding = app.state::<Mutex<LauncherConfig>>();
      let mut config_state = config_binding.lock()?;

      config_state.general.functionality.full_login = !account_state.players.is_empty();
      config_state.save()?;
    }
  };
  Ok(())
}
