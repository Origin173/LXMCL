use serde_json::{json, Value};
use std::path::PathBuf;
use tauri_plugin_http::reqwest;

use crate::{
  error::{SJMCLError, SJMCLResult},
  instance::models::misc::{ModLoader, ModLoaderType},
  resource::{
    helpers::misc::get_download_api,
    models::{ResourceType, SourceType},
  },
  tasks::{commands::schedule_progressive_task_group, download::DownloadParam, PTaskParam},
};
use tauri::{AppHandle, State};

fn maven_to_rel_path(maven: &str) -> String {
  let mut seg = maven.split(':');
  let g = seg.next().unwrap().replace('.', "/");
  let a = seg.next().unwrap();
  let v = seg.next().unwrap();
  format!("{}/{}/{}/{}-{}.jar", g, a, v, a, v)
}

pub fn add_library_entry(
  version_json: &mut Value,
  lib_path: &str,
  maven_root: &str,
) -> SJMCLResult<()> {
  let libraries = version_json["libraries"].as_array_mut().ok_or(SJMCLError(
    "invalid version.json: libraries not array".to_string(),
  ))?;

  let (group, artifact, _version) = {
    let parts: Vec<_> = lib_path.split(':').collect();
    (parts[0], parts[1], parts[2])
  };

  let key_prefix = format!("{}:{}", group, artifact);

  if let Some(pos) = libraries.iter().position(|item| {
    item
      .get("name")
      .and_then(|n| n.as_str())
      .map(|n| n.starts_with(&key_prefix))
      .unwrap_or(false)
  }) {
    libraries[pos] = json!({
        "name": lib_path,
        "url": maven_root
    });
  } else {
    libraries.push(json!({
        "name": lib_path,
        "url": maven_root
    }));
  }

  Ok(())
}

pub async fn install_mod_loader(
  app: AppHandle,
  client: State<'_, reqwest::Client>,
  priority: &[SourceType],
  game_version: &str,
  loader: &ModLoader,
  inst_dir: &PathBuf,
  inst_name: &str,
  lib_dir: PathBuf,
  vanilla_json: &mut Value,
) -> SJMCLResult<()> {
  match loader.loader_type {
    ModLoaderType::Fabric => {
      install_fabric_loader(
        app,
        client,
        priority,
        game_version,
        loader,
        inst_dir,
        inst_name,
        lib_dir,
        vanilla_json,
      )
      .await
    }
    ModLoaderType::Forge => {
      println!("[Forge] installer TODO");
      Ok(())
    }
    ModLoaderType::NeoForge => {
      println!("[NeoForge] installer TODO");
      Ok(())
    }
    _ => Err(SJMCLError("暂不支持的加载器".to_string())),
  }
}

async fn install_fabric_loader(
  app: AppHandle,
  client: State<'_, reqwest::Client>,
  priority: &[SourceType],
  game_version: &str,
  loader: &ModLoader,
  inst_dir: &PathBuf,
  inst_name: &str,
  lib_dir: PathBuf,
  vanilla_json: &mut Value,
) -> SJMCLResult<()> {
  let loader_ver = &loader.version;

  let meta_url = get_download_api(priority[0], ResourceType::FabricMeta)?
    .join(&format!("v2/versions/loader/{game_version}/{loader_ver}"))?;

  let meta: serde_json::Value = client.get(meta_url).send().await?.json().await?;

  let loader_path = meta["loader"]["maven"]
    .as_str()
    .ok_or(SJMCLError("meta missing loader maven".to_string()))?;

  let int_path = meta["intermediary"]["maven"]
    .as_str()
    .ok_or(SJMCLError("meta missing intermediary maven".to_string()))?;

  let main_class = meta["launcherMeta"]["mainClass"]["client"]
    .as_str()
    .ok_or(SJMCLError("missing mainClass.client".to_string()))?;

  vanilla_json["mainClass"] = json!(main_class);
  vanilla_json["id"] = json!(inst_name);
  vanilla_json["jar"] = json!(inst_name);

  let maven_root = get_download_api(priority[0], ResourceType::FabricMaven)?;

  add_library_entry(vanilla_json, loader_path, maven_root.as_str())?;
  add_library_entry(vanilla_json, int_path, maven_root.as_str())?;

  let launcher_meta = &meta["launcherMeta"]["libraries"];
  for side in ["common", "server", "client"] {
    if let Some(arr) = launcher_meta.get(side).and_then(|v| v.as_array()) {
      for item in arr {
        let name = item["name"].as_str().unwrap();
        add_library_entry(vanilla_json, name, maven_root.as_str())?;
      }
    }
  }

  let mut task_params: Vec<PTaskParam> = Vec::new();

  let mut push_task = |coord: &str, url_root: &str| -> SJMCLResult<()> {
    let rel = maven_to_rel_path(coord);
    let src = url::Url::parse(url_root)?.join(&rel)?;
    task_params.push(PTaskParam::Download(DownloadParam {
      src,
      dest: lib_dir.join(&rel),
      filename: None,
      sha1: None,
    }));
    Ok(())
  };

  push_task(loader_path, maven_root.as_str())?;
  push_task(int_path, maven_root.as_str())?;

  for side in ["common", "server", "client"] {
    if let Some(arr) = launcher_meta.get(side).and_then(|v| v.as_array()) {
      for item in arr {
        let name = item["name"].as_str().unwrap();
        let url = item
          .get("url")
          .and_then(|v| v.as_str())
          .unwrap_or(maven_root.as_str());
        push_task(name, url)?;
      }
    }
  }

  schedule_progressive_task_group(
    app,
    format!("fabric-loader-install:{inst_name}"),
    task_params,
    true,
  )
  .await?;

  Ok(())
}
