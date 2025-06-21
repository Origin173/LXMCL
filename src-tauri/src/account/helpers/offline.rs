use std::sync::Mutex;

use crate::{
  account::{
    constants::TEXTURE_ROLES,
    models::{AccountError, AccountInfo, PlayerInfo, PlayerType, Texture},
  },
  error::SJMCLResult,
  launcher_config::models::LauncherConfig,
  storage::Storage,
  utils::{fs::get_app_resource_filepath, image::load_image_from_dir},
};
use rand::seq::IndexedRandom;
use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;
use uuid::Uuid;

pub fn load_preset_skin(app: &AppHandle, preset_role: String) -> SJMCLResult<Vec<Texture>> {
  let texture_path = get_app_resource_filepath(app, &format!("assets/skins/{}.png", preset_role))
    .map_err(|_| AccountError::TextureError)?;

  let texture_img = load_image_from_dir(&texture_path).ok_or(AccountError::TextureError)?;

  Ok(vec![Texture {
    texture_type: "SKIN".to_string(),
    image: texture_img.into(),
    model: "default".to_string(),
  }])
}

pub async fn login(app: &AppHandle, username: String, raw_uuid: String) -> SJMCLResult<PlayerInfo> {
  let name_with_prefix = format!("OfflinePlayer:{}", username);
  let uuid = if let Ok(id) = Uuid::parse_str(&raw_uuid) {
    id
  } else {
    if !raw_uuid.is_empty() {
      // user uses custom UUID, but it's invalid
      return Err(AccountError::Invalid)?;
    }
    Uuid::new_v5(&Uuid::NAMESPACE_URL, name_with_prefix.as_bytes())
  };
  let texture_role = TEXTURE_ROLES.choose(&mut rand::rng()).unwrap_or(&"steve");

  Ok(
    PlayerInfo {
      id: "".to_string(),
      name: username,
      uuid,
      player_type: PlayerType::Offline,
      auth_account: "".to_string(),
      password: "".to_string(),
      auth_server_url: "".to_string(),
      access_token: "".to_string(),
      refresh_token: "".to_string(),
      textures: load_preset_skin(app, texture_role.to_string())?,
    }
    .with_generated_id(),
  )
}

async fn is_china_mainland_ip(app: &AppHandle) -> SJMCLResult<bool> {
  let client = app.state::<reqwest::Client>();

  // retrieve the real IP
  let ip_resp = client
    .get("https://api-ipv4.ip.sb/ip")
    .send()
    .await
    .map_err(|_| AccountError::NetworkError)?;

  let ip = ip_resp
    .text()
    .await
    .map_err(|_| AccountError::ParseError)?
    .trim()
    .to_string();

  // get IP's country code
  let geo_resp = client
    .get(format!("https://ipapi.co/{}/country/", ip))
    .send()
    .await
    .map_err(|_| AccountError::NetworkError)?;

  let country = geo_resp
    .text()
    .await
    .map_err(|_| AccountError::ParseError)?
    .trim()
    .to_string();

  Ok(country == "CN")
}

pub async fn check_availability(app: &AppHandle) -> SJMCLResult<()> {
  match is_china_mainland_ip(app).await {
    Ok(is_china) => {
      if is_china {
        // in China, offline login is always available
        let config_binding = app.state::<Mutex<LauncherConfig>>();
        let mut config_state = config_binding.lock()?;
        config_state.general.functionality.offline_login = true;
        config_state.save()?;
      } else {
        // not in China, check if any Microsoft account has been added
        let account_binding = app.state::<Mutex<AccountInfo>>();
        let account_state = account_binding.lock().unwrap();

        let config_binding = app.state::<Mutex<LauncherConfig>>();
        let mut config_state = config_binding.lock()?;

        config_state.general.functionality.offline_login = !account_state
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

      config_state.general.functionality.offline_login = !account_state.players.is_empty();
      config_state.save()?;
    }
  };
  Ok(())
}
