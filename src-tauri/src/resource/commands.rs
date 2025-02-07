use std::sync::Mutex;
use tauri::State;

use serde_json::Value;
use tauri_plugin_http::reqwest;

use crate::{error::SJMCLResult, launcher_config::models::LauncherConfig};

use super::{
  helpers::{get_download_api, get_source_priority_list},
  models::{GameResourceInfo, ResourceError, ResourceType},
};

#[tauri::command]
pub async fn retrive_game_version_list(
  state: State<'_, Mutex<LauncherConfig>>,
) -> SJMCLResult<Vec<GameResourceInfo>> {
  let priority_list = {
    let state = state.lock()?;
    get_source_priority_list(&state)
  };
  for source in priority_list {
    let url = format!(
      "{}/mc/game/version_manifest.json",
      get_download_api(source, ResourceType::Game).await.unwrap()
    );
    match reqwest::get(url).await {
      Ok(response) => {
        if response.status().is_success() {
          match response.json::<Value>().await {
            Ok(data) => {
              let versions = data["versions"].as_array().unwrap();
              let mut game_version_list: Vec<GameResourceInfo> = vec![];
              for version in versions {
                let release_time = version["releaseTime"]
                  .as_str()
                  .ok_or(ResourceError::ParseError)?
                  .to_string();
                game_version_list.push(GameResourceInfo {
                  id: version["id"]
                    .as_str()
                    .ok_or(ResourceError::ParseError)?
                    .to_string(),
                  game_type: if release_time.contains("04-01") {
                    "april_fools".to_string()
                  } else {
                    version["type"]
                      .as_str()
                      .ok_or(ResourceError::ParseError)?
                      .to_string()
                  },
                  release_time,
                  url: version["url"]
                    .as_str()
                    .ok_or(ResourceError::ParseError)?
                    .to_string(),
                })
              }
              return Ok(game_version_list);
            }
            Err(_) => continue,
          }
        } else {
          continue;
        }
      }
      Err(_) => continue,
    }
  }
  Err(ResourceError::NoDownloadApi.into())
}
