use std::collections::HashMap;

use crate::error::SJMCLResult;
use crate::resource::models::{OtherResourceInfo, OtherResourceSearchRes, ResourceError};
use serde::Deserialize;
use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;

#[derive(Deserialize)]
pub struct ModrinthProject {
  pub project_type: String,
  pub title: String,
  pub description: String,
  pub display_categories: Vec<String>,
  pub downloads: u32,
  pub icon_url: String,
  pub date_modified: String,
}

#[derive(Deserialize)]
pub struct ModrinthSearchRes {
  pub hits: Vec<ModrinthProject>,
  pub total_hits: u32,
  pub offset: u32,
  pub limit: u32,
}

pub fn map_modrinth_to_resource_info(res: ModrinthSearchRes) -> OtherResourceSearchRes {
  let list = res
    .hits
    .into_iter()
    .map(|p| OtherResourceInfo {
      _type: p.project_type,
      name: p.title,
      description: p.description,
      icon_src: p.icon_url,
      tags: p.display_categories,
      last_updated: p.date_modified,
      downloads: p.downloads,
      source: "Modrinth".to_string(),
    })
    .collect();

  OtherResourceSearchRes {
    list,
    total: res.total_hits,
    page: res.offset / res.limit,
    page_size: res.limit,
  }
}

pub async fn fetch_resource_list_by_name_modrinth(
  app: &AppHandle,
  resource_type: &str,
  search_query: &str,
  game_version: &str,
  selected_tag: &str,
  sort_by: &str,
  page: u32,
  page_size: u32,
) -> SJMCLResult<OtherResourceSearchRes> {
  let url = "https://api.modrinth.com/v2/search";
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

  let request = client.get(url).query(&params).build()?;
  println!("Request: {}", request.url());

  if let Ok(response) = client.get(url).query(&params).send().await {
    if response.status().is_success() {
      match response.json::<ModrinthSearchRes>().await {
        Ok(results) => return Ok(map_modrinth_to_resource_info(results)),
        Err(_) => return Err(ResourceError::ParseError.into()),
      }
    } else {
      return Err(ResourceError::NetworkError.into());
    }
  } else {
    return Err(ResourceError::NetworkError.into());
  }
}
