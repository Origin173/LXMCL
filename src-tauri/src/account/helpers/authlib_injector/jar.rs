use crate::{
  account::{
    helpers::authlib_injector::constants::AUTHLIB_INJECTOR_JAR_NAME, models::AccountError,
  },
  error::SJMCLResult,
  resource::{
    helpers::misc::get_download_api,
    models::{ResourceType, SourceType},
  },
};
use std::path::PathBuf;
use tauri::{path::BaseDirectory, AppHandle, Manager};
use tauri_plugin_http::reqwest;
use url::Url;

pub fn get_jar_path(app: &AppHandle) -> SJMCLResult<PathBuf> {
  Ok(
    app
      .path()
      .resolve::<PathBuf>(AUTHLIB_INJECTOR_JAR_NAME.into(), BaseDirectory::AppData)?,
  )
}

pub async fn get_download_url(priority_list: &[SourceType]) -> SJMCLResult<Url> {
  for source in priority_list.iter() {
    let url = get_download_api(*source, ResourceType::AuthlibInjector)?;
    let response = reqwest::get(url.join("artifact/latest.json")?)
      .await
      .map_err(|_| AccountError::NetworkError)?;

    if response.status().is_success() {
      let json = response
        .json::<serde_json::Value>()
        .await
        .map_err(|_| AccountError::NetworkError)?;
      let url = json["download_url"]
        .as_str()
        .ok_or(AccountError::ParseError)?;
      return Ok(Url::parse(url).map_err(|_| AccountError::ParseError)?);
    }
  }
  Err(AccountError::NoDownloadApi.into())
}
