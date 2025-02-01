use super::helpers::get_app_version;
use super::models::{LauncherConfig, LauncherConfigError, MemoryInfo};
use crate::storage::Storage;
use crate::{error::SJMCLResult, partial::PartialUpdate};
use std::fs;
use std::path::PathBuf;
use systemstat::{saturating_sub_bytes, Platform};
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;

#[tauri::command]
pub fn get_launcher_config() -> SJMCLResult<LauncherConfig> {
  let state: LauncherConfig = Storage::load().unwrap_or_default();
  Ok(state)
}

#[tauri::command]
pub fn update_launcher_config(key_path: String, value: String) -> SJMCLResult<()> {
  let mut snake = String::new();
  for (i, ch) in key_path.char_indices() {
    if i > 0 && ch.is_uppercase() {
      snake.push('_');
    }
    snake.push(ch.to_ascii_lowercase());
  }
  let mut state: LauncherConfig = Storage::load().unwrap_or_default();
  state.update(&snake, &value)?;
  state.save()?;
  Ok(())
}

#[tauri::command]
pub fn restore_launcher_config(app: AppHandle) -> SJMCLResult<LauncherConfig> {
  let mut state = LauncherConfig::default();
  // Set and create default download cache dir
  state.download.cache.directory = app
    .path()
    .resolve::<PathBuf>("Download".into(), BaseDirectory::AppCache)?;
  if !state.download.cache.directory.exists() {
    fs::create_dir_all(&state.download.cache.directory).unwrap();
  }
  state.save()?;
  Ok(state)
}

#[tauri::command]
pub async fn export_launcher_config(app: AppHandle) -> SJMCLResult<String> {
  let state: LauncherConfig = Storage::load().unwrap_or_default();
  let version = get_app_version(app);
  let client = reqwest::Client::new();
  match client
    .post("https://mc.sjtu.cn/api-sjmcl/settings")
    .header("Content-Type", "application/json")
    .body(
      serde_json::json!({
        "version": version,
        "json_data": state.clone(),
      })
      .to_string(),
    )
    .send()
    .await
  {
    Ok(response) => {
      let status = response.status();
      let json: serde_json::Value = response
        .json()
        .await
        .map_err(|_| LauncherConfigError::FetchError)?;
      if status.is_success() {
        let code = json["code"]
          .as_str()
          .ok_or_else(|| LauncherConfigError::FetchError)?
          .to_string();

        Ok(code)
      } else {
        Err(LauncherConfigError::FetchError.into())
      }
    }
    Err(_) => Err(LauncherConfigError::FetchError.into()),
  }
}

#[tauri::command]
pub async fn import_launcher_config(app: AppHandle, code: String) -> SJMCLResult<LauncherConfig> {
  let version = get_app_version(app);
  let client = reqwest::Client::new();
  match client
    .post("https://mc.sjtu.cn/api-sjmcl/validate")
    .header("Content-Type", "application/json")
    .body(
      serde_json::json!({
        "version": version,
        "code": code,
      })
      .to_string(),
    )
    .send()
    .await
  {
    Ok(response) => {
      let status = response.status();
      let json: serde_json::Value = response
        .json()
        .await
        .map_err(|_| LauncherConfigError::FetchError)?;
      if status.is_success() {
        let state: LauncherConfig =
          serde_json::from_value(json).map_err(|_| LauncherConfigError::FetchError)?;
        state.save()?;

        Ok(state)
      } else {
        let message = json["message"]
          .as_str()
          .ok_or_else(|| LauncherConfigError::FetchError)?;
        match message {
          "Invalid code" => Err(LauncherConfigError::InvalidCode.into()),
          "Code expired" => Err(LauncherConfigError::CodeExpired.into()),
          "Version mismatch" => Err(LauncherConfigError::VersionMismatch.into()),
          _ => Err(LauncherConfigError::FetchError.into()),
        }
      }
    }
    Err(_err) => Err(LauncherConfigError::FetchError.into()),
  }
}

#[tauri::command]
pub fn get_memory_info() -> SJMCLResult<MemoryInfo> {
  let sys = systemstat::System::new();
  let mem = sys.memory()?;
  Ok(MemoryInfo {
    total: mem.total.as_u64(),
    used: saturating_sub_bytes(mem.total, mem.free).as_u64(),
  })
}
