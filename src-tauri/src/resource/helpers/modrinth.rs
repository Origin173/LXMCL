use crate::error::SJMCLResult;
use crate::resource::models::{
  OtherResourceFileInfo, OtherResourceInfo, OtherResourceSearchQuery, OtherResourceSearchRes,
  OtherResourceVersionPack, OtherResourceVersionPackQuery, ResourceError,
};
use hex;
use sha1::{Digest, Sha1};
use std::collections::HashMap;
use std::fs;
use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;

use super::modrinth_misc::{
  get_modrinth_api, map_modrinth_file_to_version_pack, ModrinthApiEndpoint, ModrinthProject,
  ModrinthSearchRes, ModrinthVersionPack,
};

pub async fn fetch_resource_list_by_name_modrinth(
  app: &AppHandle,
  query: &OtherResourceSearchQuery,
) -> SJMCLResult<OtherResourceSearchRes> {
  let url = get_modrinth_api(ModrinthApiEndpoint::Search, None)?;

  let OtherResourceSearchQuery {
    resource_type,
    search_query,
    game_version,
    selected_tag,
    sort_by,
    page,
    page_size,
  } = query;

  let mut facets = vec![vec![format!("project_type:{}", resource_type)]];
  if !game_version.is_empty() && game_version != "All" {
    facets.push(vec![format!("versions:{}", game_version)]);
  }
  if !selected_tag.is_empty() && selected_tag != "All" {
    facets.push(vec![format!("categories:{}", selected_tag)]);
  }

  let mut params = HashMap::new();
  params.insert("query", search_query.to_string());
  params.insert("facets", serde_json::to_string(&facets).unwrap());
  params.insert("offset", (page * page_size).to_string());
  params.insert("limit", page_size.to_string());
  params.insert("index", sort_by.to_string());

  let client = app.state::<reqwest::Client>();

  if let Ok(response) = client.get(&url).query(&params).send().await {
    if response.status().is_success() {
      match response.json::<ModrinthSearchRes>().await {
        Ok(results) => Ok(results.into()),
        Err(_) => Err(ResourceError::ParseError.into()),
      }
    } else {
      Err(ResourceError::NetworkError.into())
    }
  } else {
    Err(ResourceError::NetworkError.into())
  }
}

pub async fn fetch_resource_version_packs_modrinth(
  app: &AppHandle,
  query: &OtherResourceVersionPackQuery,
) -> SJMCLResult<Vec<OtherResourceVersionPack>> {
  let OtherResourceVersionPackQuery {
    resource_id,
    mod_loader,
    game_versions,
  } = query;

  let url = get_modrinth_api(ModrinthApiEndpoint::ProjectVersions, Some(resource_id))?;

  let mut params = HashMap::new();
  if mod_loader != "All" {
    params.insert("loaders", format!("[\"{}\"]", mod_loader.to_lowercase()));
  }
  if game_versions.first() != Some(&"All".to_string()) {
    let versions_json = format!(
      "[{}]",
      game_versions
        .iter()
        .map(|v| format!("\"{}\"", v))
        .collect::<Vec<_>>()
        .join(",")
    );

    params.insert("game_versions", versions_json);
  }

  let client = app.state::<reqwest::Client>();

  let response = client
    .get(&url)
    .query(&params)
    .send()
    .await
    .map_err(|_| ResourceError::NetworkError)?;

  if !response.status().is_success() {
    return Err(ResourceError::NetworkError.into());
  }

  let results = response
    .json::<Vec<ModrinthVersionPack>>()
    .await
    .map_err(|_| ResourceError::ParseError)?;

  Ok(map_modrinth_file_to_version_pack(results))
}

pub async fn fetch_remote_resource_by_local_modrinth(
  app: &AppHandle,
  file_path: &String,
) -> SJMCLResult<OtherResourceFileInfo> {
  let file_content = fs::read(file_path).map_err(|_| ResourceError::ParseError)?;

  let mut hasher = Sha1::new();
  hasher.update(&file_content);
  let hash = hasher.finalize();
  let hash_string = hex::encode(hash);

  let mut params = HashMap::new();
  params.insert("algorithm", "sha1");

  let url = get_modrinth_api(ModrinthApiEndpoint::VersionFile, Some(&hash_string))?;
  let client = app.state::<reqwest::Client>();

  let response = client
    .get(&url)
    .query(&params)
    .send()
    .await
    .map_err(|_| ResourceError::NetworkError)?;

  if !response.status().is_success() {
    return Err(ResourceError::NetworkError.into());
  }

  let version_pack = response
    .json::<ModrinthVersionPack>()
    .await
    .map_err(|_| ResourceError::ParseError)?;

  let file_info = version_pack
    .files
    .iter()
    .find(|file| file.hashes.sha1 == hash_string)
    .or_else(|| version_pack.files.first())
    .ok_or(ResourceError::ParseError)?;

  Ok(
    (
      &version_pack,
      file_info,
      if version_pack.loaders.is_empty() {
        None
      } else {
        Some(version_pack.loaders[0].clone())
      },
    )
      .into(),
  )
}

pub async fn fetch_remote_resource_by_id_modrinth(
  app: &AppHandle,
  resource_id: &String,
) -> SJMCLResult<OtherResourceInfo> {
  let url = get_modrinth_api(ModrinthApiEndpoint::Project, Some(resource_id))?;
  let client = app.state::<reqwest::Client>();

  let response = client
    .get(&url)
    .send()
    .await
    .map_err(|_| ResourceError::NetworkError)?;

  if !response.status().is_success() {
    return Err(ResourceError::NetworkError.into());
  }

  let results = response
    .json::<ModrinthProject>()
    .await
    .map_err(|_| ResourceError::ParseError)?;

  Ok(results.into())
}
