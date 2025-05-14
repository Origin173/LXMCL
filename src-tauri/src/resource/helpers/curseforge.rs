use crate::error::SJMCLResult;
use crate::resource::models::{OtherResourceInfo, OtherResourceSearchRes};
use tauri::AppHandle;

pub async fn fetch_resource_list_by_name_curseforge(
  app: &AppHandle,
  resource_type: &str,
  search_query: &str,
  game_version: &str,
  selected_tag: &str,
  sort_by: &str,
  page: u32,
  page_size: u32,
) -> SJMCLResult<OtherResourceSearchRes> {
  let prefix = "https://api.curseforge.com";
  Ok(OtherResourceSearchRes {
    list: vec![OtherResourceInfo {
      _type: resource_type.to_string(),
      name: search_query.to_string(),
      description: "CurseForge search is still developing...".to_string(),
      icon_src: "https://media.forgecdn.net/avatars/thumbnails/29/69/64/64/635838945588716414.jpeg"
        .to_string(),
      tags: vec!["UI".to_string(), "QoL".to_string()],
      last_updated: "2023-10-01".to_string(),
      downloads: page * page_size, // TBD
    }],
    total: 1,
    page: page,
    page_size: page_size,
  })
}
