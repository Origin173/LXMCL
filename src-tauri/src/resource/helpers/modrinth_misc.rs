use crate::error::SJMCLResult;
use crate::resource::models::{
  OtherResourceDependency, OtherResourceFileInfo, OtherResourceInfo, OtherResourceSearchRes,
  OtherResourceSource, OtherResourceVersionPack, ResourceError,
};
use serde::Deserialize;

use super::misc::version_pack_sort;

#[derive(Deserialize, Debug)]
pub struct ModrinthProject {
  pub project_id: String,
  pub project_type: String,
  pub slug: String,
  pub title: String,
  pub description: String,
  pub display_categories: Vec<String>,
  pub downloads: u32,
  pub icon_url: String,
  pub date_modified: String,
}

#[derive(Deserialize, Debug)]
pub struct ModrinthGetProjectRes {
  pub id: String,
  pub project_type: String,
  pub slug: String,
  pub title: String,
  pub description: String,
  pub categories: Vec<String>,
  pub downloads: u32,
  pub icon_url: String,
  pub updated: String,
}

#[derive(Deserialize, Debug)]
pub struct ModrinthSearchRes {
  pub hits: Vec<ModrinthProject>,
  pub total_hits: u32,
  pub offset: u32,
  pub limit: u32,
}

#[derive(Deserialize, Debug)]
pub struct ModrinthFileHash {
  pub sha1: String,
}

#[derive(Deserialize, Debug)]
pub struct ModrinthFileInfo {
  pub url: String,
  pub filename: String,
  pub hashes: ModrinthFileHash,
}

#[derive(Deserialize, Debug)]
pub struct ModrinthFileDependency {
  pub project_id: String,
  pub dependency_type: String,
}

#[derive(Deserialize, Debug)]
pub struct ModrinthVersionPack {
  pub project_id: String,
  pub dependencies: Vec<ModrinthFileDependency>,
  pub game_versions: Vec<String>,
  pub loaders: Vec<String>,
  pub name: String,
  pub date_published: String,
  pub downloads: u32,
  pub version_type: String,
  pub files: Vec<ModrinthFileInfo>,
}

#[derive(Debug, Clone, Copy)]
pub enum ModrinthApiEndpoint {
  Search,
  ProjectVersions,
  VersionFile,
  Project,
}

pub fn get_modrinth_api(endpoint: ModrinthApiEndpoint, param: Option<&str>) -> SJMCLResult<String> {
  let base_url = "https://api.modrinth.com/v2";

  let url_str = match endpoint {
    ModrinthApiEndpoint::Search => format!("{}/search", base_url),
    ModrinthApiEndpoint::ProjectVersions => {
      let project_id = param.ok_or(ResourceError::ParseError)?;
      format!("{}/project/{}/version", base_url, project_id)
    }
    ModrinthApiEndpoint::VersionFile => {
      let hash = param.ok_or(ResourceError::ParseError)?;
      format!("{}/version_file/{}", base_url, hash)
    }
    ModrinthApiEndpoint::Project => {
      let project_id = param.ok_or(ResourceError::ParseError)?;
      format!("{}/project/{}", base_url, project_id)
    }
  };

  Ok(url_str)
}

pub fn map_modrinth_version_pack_to_other_resource_file_info(
  version: &ModrinthVersionPack,
  file: &ModrinthFileInfo,
  loader: Option<String>,
) -> OtherResourceFileInfo {
  OtherResourceFileInfo {
    resource_id: version.project_id.clone(),
    name: version.name.clone(),
    release_type: version.version_type.clone(),
    downloads: version.downloads,
    file_date: version.date_published.clone(),
    download_url: file.url.clone(),
    sha1: file.hashes.sha1.clone(),
    file_name: file.filename.clone(),
    dependencies: version
      .dependencies
      .iter()
      .map(|dep| OtherResourceDependency {
        resource_id: dep.project_id.clone(),
        relation: dep.dependency_type.clone(),
      })
      .collect(),
    loader,
  }
}

fn normalize_modrinth_loader(loader: &str) -> Option<String> {
  if loader.is_empty() || loader == "minecraft" {
    None
  } else {
    match loader.to_lowercase().as_str() {
      "forge" => Some("Forge".to_string()),
      "fabric" => Some("Fabric".to_string()),
      "neoforge" => Some("NeoForge".to_string()),
      "vanilla" => Some("Vanilla".to_string()),
      "iris" => Some("Iris".to_string()),
      "canvas" => Some("Canvas".to_string()),
      "optifine" => Some("OptiFine".to_string()),
      _ => Some(loader.to_string()),
    }
  }
}

pub fn map_modrinth_to_resource_info(res: ModrinthSearchRes) -> OtherResourceSearchRes {
  let list = res
    .hits
    .into_iter()
    .map(|p| OtherResourceInfo {
      id: p.project_id,
      _type: p.project_type,
      name: p.title,
      description: p.description,
      icon_src: p.icon_url,
      website_url: format!("https://modrinth.com/mod/{}", p.slug),
      tags: p.display_categories,
      last_updated: p.date_modified,
      downloads: p.downloads,
      source: OtherResourceSource::Modrinth,
    })
    .collect();

  OtherResourceSearchRes {
    list,
    total: res.total_hits,
    page: res.offset / res.limit,
    page_size: res.limit,
  }
}

pub fn map_modrinth_file_to_version_pack(
  res: Vec<ModrinthVersionPack>,
) -> Vec<OtherResourceVersionPack> {
  let mut version_packs = std::collections::HashMap::new();

  for version in res {
    let game_versions = if version.game_versions.is_empty() {
      vec!["".to_string()]
    } else {
      version.game_versions
    };

    const ALLOWED_LOADERS: &[&str] = &[
      "forge",
      "fabric",
      "neoforge",
      "vanilla",
      "iris",
      "canvas",
      "optifine",
      "minecraft",
    ];

    let loaders = if version.loaders.is_empty() {
      vec!["".to_string()]
    } else {
      version
        .loaders
        .iter()
        .filter(|loader| ALLOWED_LOADERS.contains(&loader.as_str()))
        .cloned()
        .collect::<Vec<_>>()
    };

    for game_version in &game_versions {
      for loader in &loaders {
        let file_infos = version
          .files
          .iter()
          .map(|file| {
            map_modrinth_version_pack_to_other_resource_file_info(
              &version,
              file,
              normalize_modrinth_loader(loader),
            )
          })
          .collect::<Vec<_>>();

        version_packs
          .entry(game_version.clone())
          .or_insert_with(|| OtherResourceVersionPack {
            name: game_version.clone(),
            items: Vec::new(),
          })
          .items
          .extend(file_infos);
      }
    }
  }

  let mut list: Vec<OtherResourceVersionPack> = version_packs.into_values().collect();
  list.sort_by(version_pack_sort);

  list
}
