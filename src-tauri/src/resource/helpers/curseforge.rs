use std::collections::HashMap;
use std::env;

use crate::error::SJMCLResult;
use crate::resource::helpers::curseforge_categories::cvt_category_to_id;
use crate::resource::models::{
  ExtraResourceInfo, ExtraResourceSearchQuery, ExtraResourceSearchRes, ResourceError,
};
use serde::Deserialize;
use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CurseForgeCategory {
  pub name: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CurseForgeLogo {
  pub url: String,
}

fn default_logo() -> CurseForgeLogo {
  CurseForgeLogo {
    url: "".to_string(),
  }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CurseForgeProject {
  pub class_id: u32,
  pub name: String,
  pub summary: String,
  pub categories: Vec<CurseForgeCategory>,
  pub download_count: u32,
  pub logo: Option<CurseForgeLogo>, // In some old projects, logo is null
  pub date_modified: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CurseForgePagination {
  pub index: u32,
  pub page_size: u32,
  pub total_count: u32,
}

#[derive(Deserialize)]
pub struct CurseForgeSearchRes {
  pub data: Vec<CurseForgeProject>,
  pub pagination: CurseForgePagination,
}

pub fn cvt_class_id_to_type(class_id: u32) -> String {
  match class_id {
    6 => "mod".to_string(),
    12 => "resourcepack".to_string(),
    17 => "world".to_string(),
    4471 => "modpack".to_string(),
    6552 => "shader".to_string(),
    6945 => "datapack".to_string(),
    _ => "unknown".to_string(),
  }
}

pub fn cvt_type_to_class_id(_type: &str) -> u32 {
  match _type {
    "mod" => 6,
    "resourcepack" => 12,
    "world" => 17,
    "modpack" => 4471,
    "shader" => 6552,
    "datapack" => 6945,
    _ => 0,
  }
}

pub fn cvt_sort_by_to_id(sort_by: &str) -> u32 {
  match sort_by {
    "Popularity" => 2,
    "A-Z" => 4,
    "Latest update" => 3,
    "Creation date" => 11,
    "Total downloads" => 6,
    _ => 2,
  }
}

pub fn map_curseforge_to_resource_info(res: CurseForgeSearchRes) -> ExtraResourceSearchRes {
  let list = res
    .data
    .into_iter()
    .map(|p| ExtraResourceInfo {
      _type: cvt_class_id_to_type(p.class_id),
      name: p.name,
      description: p.summary,
      icon_src: p.logo.unwrap_or_else(default_logo).url,
      tags: p.categories.iter().map(|c| c.name.clone()).collect(),
      last_updated: p.date_modified,
      downloads: p.download_count,
      source: "CurseForge".to_string(),
    })
    .collect();

  ExtraResourceSearchRes {
    list,
    total: res.pagination.total_count,
    page: res.pagination.index / res.pagination.page_size,
    page_size: res.pagination.page_size,
  }
}

pub async fn fetch_resource_list_by_name_curseforge(
  app: &AppHandle,
  query: &ExtraResourceSearchQuery,
) -> SJMCLResult<ExtraResourceSearchRes> {
  let url = "https://api.curseforge.com/v1/mods/search";

  let ExtraResourceSearchQuery {
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
  let _ = client.get(url).query(&params).build()?;

  let response = client
    .get(url)
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
