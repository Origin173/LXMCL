use crate::error::SJMCLResult;
use crate::resource::models::{
  ExtraResourceInfo, ExtraResourceSearchQuery, ExtraResourceSearchRes, ResourceError,
};
use serde::Deserialize;
use std::collections::HashMap;
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

pub fn map_modrinth_to_resource_info(res: ModrinthSearchRes) -> ExtraResourceSearchRes {
  let list = res
    .hits
    .into_iter()
    .map(|p| ExtraResourceInfo {
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

  ExtraResourceSearchRes {
    list,
    total: res.total_hits,
    page: res.offset / res.limit,
    page_size: res.limit,
  }
}

pub async fn fetch_resource_list_by_name_modrinth(
  app: &AppHandle,
  query: &ExtraResourceSearchQuery,
) -> SJMCLResult<ExtraResourceSearchRes> {
  let url = "https://api.modrinth.com/v2/search";

  let ExtraResourceSearchQuery {
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

  let _ = client.get(url).query(&params).build()?;

  if let Ok(response) = client.get(url).query(&params).send().await {
    if response.status().is_success() {
      match response.json::<ModrinthSearchRes>().await {
        Ok(results) => Ok(map_modrinth_to_resource_info(results)),
        Err(_) => Err(ResourceError::ParseError.into()),
      }
    } else {
      Err(ResourceError::NetworkError.into())
    }
  } else {
    Err(ResourceError::NetworkError.into())
  }
}
