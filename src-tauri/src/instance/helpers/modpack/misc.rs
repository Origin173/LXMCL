use std::{fs::File, sync::Mutex};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::{
  error::SJMCLResult,
  instance::{
    helpers::modpack::{curseforge::CurseForgeManifest, modrinth::ModrinthManifest},
    models::misc::InstanceError,
  },
  launcher_config::models::LauncherConfig,
  resource::{
    helpers::{misc::get_source_priority_list, version_manifest::get_game_version_manifest},
    models::{GameClientResourceInfo, ModLoaderResourceInfo, ResourceDownloadType},
  },
};

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ModpackResourceInfo {
  pub name: String,
  pub version: String,
  pub description: Option<String>,
  pub author: Option<String>,
  pub modpack_type: ResourceDownloadType,
  pub game_info: GameClientResourceInfo,
  pub mod_loader_info: ModLoaderResourceInfo,
}

impl ModpackResourceInfo {
  pub async fn from_archive(app: &AppHandle, file: &File) -> SJMCLResult<Self> {
    let launcher_config_state = app.state::<Mutex<LauncherConfig>>();
    // Get priority list
    let priority_list = {
      let launcher_config = launcher_config_state.lock()?;
      get_source_priority_list(&launcher_config)
    };
    let versions = get_game_version_manifest(app, &priority_list).await?;
    if let Ok(manifest) = CurseForgeManifest::from_archive(file) {
      let client_version = manifest.get_client_version();
      let game_info = versions
        .into_iter()
        .find(|v| v.id == client_version)
        .ok_or(InstanceError::ModpackManifestParseError)?;
      let (loader_type, version) = manifest.get_mod_loader_type_version();
      Ok(ModpackResourceInfo {
        modpack_type: ResourceDownloadType::CurseForge,
        name: manifest.name,
        version: manifest.version,
        description: None,
        author: Some(manifest.author),
        game_info,
        mod_loader_info: ModLoaderResourceInfo {
          loader_type,
          version,
          ..Default::default()
        },
      })
    } else if let Ok(manifest) = ModrinthManifest::from_archive(file) {
      let client_version = manifest.get_client_version()?;
      let game_info = versions
        .into_iter()
        .find(|v| v.id == client_version)
        .ok_or(InstanceError::ModpackManifestParseError)?;
      let (loader_type, version) = manifest.get_mod_loader_type_version()?;
      Ok(ModpackResourceInfo {
        modpack_type: ResourceDownloadType::Modrinth,
        name: manifest.name,
        version: manifest.version_id,
        description: manifest.summary,
        author: None,
        game_info,
        mod_loader_info: ModLoaderResourceInfo {
          loader_type,
          version,
          ..Default::default()
        },
      })
    } else {
      Err(InstanceError::ModpackManifestParseError.into())
    }
  }
}
