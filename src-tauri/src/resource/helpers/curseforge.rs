use murmur2::murmur2;
use serde_json::json;
use std::collections::HashMap;
use std::env;
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::Path;

use crate::error::SJMCLResult;
use crate::resource::models::{
  OtherResourceDependency, OtherResourceFileInfo, OtherResourceInfo, OtherResourceSearchQuery,
  OtherResourceSearchRes, OtherResourceSource, OtherResourceVersionPack,
  OtherResourceVersionPackQuery, ResourceError,
};
use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;

use super::curseforge_misc::{
  cvt_category_to_id, cvt_class_id_to_type, cvt_id_to_dependency_type, cvt_id_to_release_type,
  cvt_mod_loader_to_id, cvt_sort_by_to_id, cvt_type_to_class_id, cvt_version_to_type_id,
  default_logo, get_curseforge_api, map_curseforge_file_info_to_other_resource_file_info,
  map_curseforge_file_to_version_pack, map_curseforge_to_resource_info, CurseForgeApiEndpoint,
  CurseForgeFileInfo, CurseForgeFingerprintRes, CurseForgeGetProjectRes, CurseForgeSearchRes,
  CurseForgeVersionPackSearchRes,
};
pub async fn fetch_resource_list_by_name_curseforge(
  app: &AppHandle,
  query: &OtherResourceSearchQuery,
) -> SJMCLResult<OtherResourceSearchRes> {
  let url = get_curseforge_api(CurseForgeApiEndpoint::Search, None)?;

  let OtherResourceSearchQuery {
    resource_type,
    search_query,
    game_version,
    selected_tag,
    sort_by,
    page,
    page_size,
  } = query;

  let class_id = cvt_type_to_class_id(resource_type);
  let sort_field = cvt_sort_by_to_id(sort_by);
  let sort_order = match sort_field {
    4 => "asc",
    _ => "desc",
  };

  let mut params = HashMap::new();
  params.insert("gameId", "432".to_string());
  params.insert("classId", class_id.to_string());
  params.insert("searchFilter", search_query.to_string());
  if game_version != "All" {
    params.insert("gameVersion", game_version.to_string());
  }
  if selected_tag != "All" {
    params.insert(
      "categoryId",
      cvt_category_to_id(selected_tag, class_id).to_string(),
    );
  }
  params.insert("sortField", sort_field.to_string());
  params.insert("sortOrder", sort_order.to_string());
  params.insert("index", (page * page_size).to_string());
  params.insert("pageSize", page_size.to_string());

  let client = app.state::<reqwest::Client>();

  let response = client
    .get(&url)
    .query(&params)
    .header("x-api-key", env!("SJMCL_CURSEFORGE_API_KEY"))
    .header("accept", "application/json")
    .send()
    .await
    .map_err(|_| ResourceError::NetworkError)?;

  if !response.status().is_success() {
    return Err(ResourceError::NetworkError.into());
  }

  let results = response
    .json::<CurseForgeSearchRes>()
    .await
    .map_err(|_| ResourceError::ParseError)?;

  Ok(map_curseforge_to_resource_info(results))
}

pub async fn fetch_resource_version_packs_curseforge(
  app: &AppHandle,
  query: &OtherResourceVersionPackQuery,
) -> SJMCLResult<Vec<OtherResourceVersionPack>> {
  let mut aggregated_files: Vec<CurseForgeFileInfo> = Vec::new();
  let mut page = 0;
  let page_size = 50;

  let OtherResourceVersionPackQuery {
    resource_id,
    mod_loader,
    game_versions,
  } = query;

  loop {
    let url = get_curseforge_api(CurseForgeApiEndpoint::ModFiles, Some(resource_id))?;

    let mut params = HashMap::new();
    if mod_loader != "All" {
      params.insert(
        "modLoaderType",
        cvt_mod_loader_to_id(mod_loader).to_string(),
      );
    }
    if game_versions.first() != Some(&"All".to_string()) {
      params.insert(
        "gameVersionTypeId",
        cvt_version_to_type_id(game_versions.first().unwrap()).to_string(),
      );
    }
    params.insert("index", (page * page_size).to_string());
    params.insert("pageSize", page_size.to_string());

    let client = app.state::<reqwest::Client>();

    let response = client
      .get(&url)
      .query(&params)
      .header("x-api-key", env!("SJMCL_CURSEFORGE_API_KEY"))
      .header("accept", "application/json")
      .send()
      .await
      .map_err(|_| ResourceError::NetworkError)?;

    if !response.status().is_success() {
      return Err(ResourceError::NetworkError.into());
    }

    let results = response
      .json::<CurseForgeVersionPackSearchRes>()
      .await
      .map_err(|_| ResourceError::ParseError)?;

    let has_more = results.pagination.total_count > (page + 1) * page_size;

    aggregated_files.extend(results.data);

    if !has_more {
      break;
    }
    page += 1;
  }

  Ok(map_curseforge_file_to_version_pack(aggregated_files))
}

pub async fn fetch_remote_resource_by_local_curseforge(
  app: &AppHandle,
  file_path: &String,
) -> SJMCLResult<OtherResourceFileInfo> {
  let file_path = Path::new(&file_path);
  if !file_path.exists() {
    return Err(ResourceError::ParseError.into());
  }

  let file = File::open(file_path).map_err(|_| ResourceError::ParseError)?;
  let mut reader = BufReader::new(file);
  let mut filtered_bytes = Vec::new();
  let mut buffer = [0; 1024];

  loop {
    match reader.read(&mut buffer) {
      Ok(0) => break,
      Ok(len) => {
        for &byte in &buffer[..len] {
          if byte != 0x09 && byte != 0x0a && byte != 0x0d && byte != 0x20 {
            filtered_bytes.push(byte);
          }
        }
      }
      Err(_) => return Err(ResourceError::ParseError.into()),
    }
  }

  let hash = murmur2(&filtered_bytes, 1) as u64;

  let url = get_curseforge_api(CurseForgeApiEndpoint::Fingerprints, None)?;
  let payload = json!({
    "fingerprints": [hash]
  });

  let client = app.state::<reqwest::Client>();
  let response = client
    .post(&url)
    .header("x-api-key", env!("SJMCL_CURSEFORGE_API_KEY"))
    .header("accept", "application/json")
    .json(&payload)
    .send()
    .await
    .map_err(|_| ResourceError::NetworkError)?;

  if !response.status().is_success() {
    return Err(ResourceError::NetworkError.into());
  }

  let fingerprint_response = response
    .json::<CurseForgeFingerprintRes>()
    .await
    .map_err(|_| ResourceError::ParseError)?;

  if let Some(exact_match) = fingerprint_response.data.exact_matches.first() {
    let cf_file = &exact_match.file;
    Ok(map_curseforge_file_info_to_other_resource_file_info(
      cf_file, None,
    ))
  } else {
    Err(ResourceError::ParseError.into())
  }
}

pub async fn fetch_remote_resource_by_id_curseforge(
  app: &AppHandle,
  resource_id: &String,
) -> SJMCLResult<OtherResourceInfo> {
  let url = get_curseforge_api(CurseForgeApiEndpoint::Project, Some(resource_id))?;
  let client = app.state::<reqwest::Client>();

  let response = client
    .get(&url)
    .header("x-api-key", env!("SJMCL_CURSEFORGE_API_KEY"))
    .header("accept", "application/json")
    .send()
    .await
    .map_err(|_| ResourceError::NetworkError)?;

  if !response.status().is_success() {
    return Err(ResourceError::NetworkError.into());
  }

  let results = response
    .json::<CurseForgeGetProjectRes>()
    .await
    .map_err(|_| ResourceError::ParseError)?;

  let resource = results.data;

  Ok(OtherResourceInfo {
    id: resource.id.to_string(),
    _type: cvt_class_id_to_type(resource.class_id),
    name: resource.name,
    description: resource.summary,
    icon_src: resource.logo.unwrap_or_else(default_logo).url,
    website_url: resource.links.website_url,
    tags: resource.categories.iter().map(|c| c.name.clone()).collect(),
    last_updated: resource.date_modified,
    downloads: resource.download_count,
    source: OtherResourceSource::CurseForge,
  })
}
