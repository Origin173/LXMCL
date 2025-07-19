use super::super::super::launch::helpers::file_validator::convert_library_name_to_path;
use reqwest::redirect::Policy;
use reqwest::{Client, Error};
use serde_json::{json, Value};
use std::cmp::Ordering;
use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use tauri_plugin_http::reqwest;
use zip::ZipArchive;

use crate::{
  error::{SJMCLError, SJMCLResult},
  instance::helpers::game_version::compare_game_versions,
  instance::models::misc::{ModLoader, ModLoaderType},
  resource::{
    helpers::misc::get_download_api,
    models::{ResourceType, SourceType},
  },
  tasks::{commands::schedule_progressive_task_group, download::DownloadParam, PTaskParam},
};
use tauri::{AppHandle, State};

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

async fn fetch_forge_installer_url(
  game_version: &str,
  loader_ver: &str,
  branch: Option<&str>,
) -> Result<String, Error> {
  let client = Client::builder().redirect(Policy::limited(5)).build()?;

  let url = format!(
        "https://bmclapi2.bangbang93.com/forge/download?mcversion={game_version}&version={loader_ver}&branch={branch}&category=installer&format=jar",
        game_version = game_version,
        loader_ver = loader_ver,
        branch = branch.unwrap_or("")
    );

  let response = client.get(&url).send().await?;

  let final_url = response.url().to_string();
  Ok(final_url)
}

pub async fn install_mod_loader(
  app: AppHandle,
  client: State<'_, reqwest::Client>,
  priority: &[SourceType],
  game_version: &str,
  loader: &ModLoader,
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
        inst_name,
        lib_dir,
        vanilla_json,
      )
      .await
    }
    ModLoaderType::Forge => {
      install_forge_loader(app, priority, game_version, loader, inst_name, lib_dir).await
    }
    ModLoaderType::NeoForge => {
      install_neoforge_loader(app, priority, loader, inst_name, lib_dir).await
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
  inst_name: &str,
  lib_dir: PathBuf,
  vanilla_json: &mut Value,
) -> SJMCLResult<()> {
  let loader_ver = &loader.version;

  let old_json = vanilla_json.clone();

  let mut new_json = json!({});

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

  new_json["id"] = json!("fabric");
  new_json["mainClass"] = json!(main_class);
  new_json["version"] = json!(loader_ver);
  new_json["arguments"] = json!({});
  new_json["libraries"] = json!([]);

  let maven_root = get_download_api(priority[0], ResourceType::FabricMaven)?;

  add_library_entry(vanilla_json, loader_path, maven_root.as_str())?;
  add_library_entry(vanilla_json, int_path, maven_root.as_str())?;

  if let Some(libraries) = new_json["libraries"].as_array_mut() {
    libraries.push(json!({
        "name": loader_path,
        "url": maven_root
    }));
    libraries.push(json!({
        "name": int_path,
        "url": maven_root
    }));
  }

  let launcher_meta = &meta["launcherMeta"]["libraries"];
  for side in ["common", "server", "client"] {
    if let Some(arr) = launcher_meta.get(side).and_then(|v| v.as_array()) {
      for item in arr {
        let name = item["name"].as_str().unwrap();
        add_library_entry(vanilla_json, name, maven_root.as_str())?;
        if let Some(libraries) = new_json["libraries"].as_array_mut() {
          libraries.push(json!({
              "name": name,
              "url": maven_root
          }));
        }
      }
    }
  }

  let mut task_params: Vec<PTaskParam> = Vec::new();

  let mut push_task = |coord: &str, url_root: &str| -> SJMCLResult<()> {
    let rel: String = convert_library_name_to_path(&coord.to_string(), None)?;
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

  vanilla_json["patches"] = json!([old_json, new_json]);

  schedule_progressive_task_group(
    app,
    format!("fabric-loader-install:{inst_name}"),
    task_params,
    true,
  )
  .await?;

  Ok(())
}

async fn install_neoforge_loader(
  app: AppHandle,
  priority: &[SourceType],
  loader: &ModLoader,
  inst_name: &str,
  lib_dir: PathBuf,
) -> SJMCLResult<()> {
  let loader_ver = &loader.version;

  let root = get_download_api(priority[0], ResourceType::NeoforgeInstall)?;

  let installer_url = match priority.first().unwrap_or(&SourceType::Official) {
    SourceType::Official => {
      let path = format!(
        "net/neoforged/neoforge/{v}/neoforge-{v}-installer.jar",
        v = loader_ver
      );
      root.join(&path)?
    }
    SourceType::BMCLAPIMirror => {
      let path = format!("{v}/download/installer", v = loader_ver);
      root.join(&path)?
    }
  };

  let installer_coord = format!("net.neoforged:neoforge:{}-installer", loader.version);
  let installer_rel = convert_library_name_to_path(&installer_coord, None)?;
  let installer_path = lib_dir.join(&installer_rel);

  schedule_progressive_task_group(
    app,
    format!("neoforge-installer-download:{inst_name}"),
    vec![PTaskParam::Download(DownloadParam {
      src: installer_url,
      dest: installer_path,
      filename: None,
      sha1: None,
    })],
    true,
  )
  .await?;

  Ok(())
}

async fn install_forge_loader(
  app: AppHandle,
  priority: &[SourceType],
  game_version: &str,
  loader: &ModLoader,
  inst_name: &str,
  lib_dir: PathBuf,
) -> SJMCLResult<()> {
  let loader_ver = &loader.version;

  let root = get_download_api(priority[0], ResourceType::ForgeInstall)?;

  let installer_url = match priority.first().unwrap_or(&SourceType::Official) {
    SourceType::Official => {
      let path = format!(
        "{mc_ver}-{fg_ver}/forge-{mc_ver}-{fg_ver}-installer.jar",
        mc_ver = game_version,
        fg_ver = loader_ver
      );
      root.join(&path)?
    }
    SourceType::BMCLAPIMirror => {
      url::Url::parse(&fetch_forge_installer_url(game_version, loader_ver, None).await?)?
    }
  };

  let installer_coord = format!("net.minecraftforge:forge:{}-installer", loader.version);
  let installer_rel = convert_library_name_to_path(&installer_coord, None)?;
  let installer_path = lib_dir.join(&installer_rel);

  schedule_progressive_task_group(
    app,
    format!("forge-installer-download:{inst_name}"),
    vec![PTaskParam::Download(DownloadParam {
      src: installer_url,
      dest: installer_path,
      filename: None,
      sha1: None,
    })],
    true,
  )
  .await?;

  Ok(())
}

pub async fn finish_forge_install(
  app: AppHandle,
  game_version: &str,
  loader: &ModLoader,
  inst_name: &str,
  lib_dir: PathBuf,
  vanilla_json: &mut Value,
) -> SJMCLResult<()> {
  let installer_coord = format!("net.minecraftforge:forge:{}-installer", loader.version);
  let installer_rel = convert_library_name_to_path(&installer_coord, None)?;
  let installer_path = lib_dir.join(&installer_rel);
  let comparison = compare_game_versions(&app, game_version, "1.13").await;
  if comparison != Ordering::Less {
    let (content, version) = {
      let file = File::open(&installer_path)?;
      let mut archive = ZipArchive::new(file)?;

      let mut s = String::new();
      {
        let mut install_profile = archive.by_name("install_profile.json")?;
        install_profile.read_to_string(&mut s)?;
      }

      let mut t = String::new();
      {
        let mut version_file = archive.by_name("version.json")?;
        version_file.read_to_string(&mut t)?;
      }

      (s, t)
    };

    let profile_json: serde_json::Value = serde_json::from_str(&content)?;
    let version_json: serde_json::Value = serde_json::from_str(&version)?;

    let main_class = version_json["mainClass"].as_str().unwrap();
    let libraries = profile_json["libraries"].as_array().unwrap();

    vanilla_json["mainClass"] = json!(main_class);
    vanilla_json["id"] = json!(inst_name);
    vanilla_json["jar"] = json!(inst_name);

    let nf_game_args = version_json["arguments"]["game"]
      .as_array()
      .ok_or(SJMCLError(
        "neoforge version.json 缺少 arguments.game".into(),
      ))?;

    let v_game_args = vanilla_json["arguments"]["game"]
      .as_array_mut()
      .ok_or(SJMCLError(
        "vanilla version.json 缺少 arguments.game".into(),
      ))?;

    for arg in nf_game_args {
      v_game_args.push(arg.clone());
    }

    let nf_jvm_args = version_json["arguments"]["jvm"]
      .as_array()
      .ok_or(SJMCLError(
        "neoforge version.json 缺少 arguments.jvm".into(),
      ))?;

    let v_jvm_args = vanilla_json["arguments"]["jvm"]
      .as_array_mut()
      .ok_or(SJMCLError("vanilla version.json 缺少 arguments.jvm".into()))?;

    for arg in nf_jvm_args {
      v_jvm_args.push(arg.clone());
    }

    let mut task_params = vec![];
    for lib in libraries {
      let name = lib["name"]
        .as_str()
        .ok_or(SJMCLError("lib without name".to_string()))?;
      let url = lib["downloads"]["artifact"]["url"]
        .as_str()
        .ok_or(SJMCLError(lib.to_string()))?;

      add_library_entry(vanilla_json, name, url)?;

      let rel = convert_library_name_to_path(&name.to_string(), None)?;
      task_params.push(PTaskParam::Download(DownloadParam {
        src: url::Url::parse(url)?,
        dest: lib_dir.join(&rel),
        filename: None,
        sha1: None,
      }));
    }

    schedule_progressive_task_group(
      app,
      format!("neoforge-libraries-download:{inst_name}"),
      task_params,
      true,
    )
    .await?;
  } else {
    let file = File::open(&installer_path)?;
    let mut archive = ZipArchive::new(file)?;

    let mut content = String::new();
    {
      let mut install_profile = archive.by_name("install_profile.json")?;
      install_profile.read_to_string(&mut content)?;
    }

    let profile_json: serde_json::Value = serde_json::from_str(&content)?;

    let main_class = profile_json["versionInfo"]["mainClass"].as_str().unwrap();
    let libraries = profile_json["versionInfo"]["libraries"].as_array().unwrap();

    vanilla_json["mainClass"] = json!(main_class);
    vanilla_json["id"] = json!(inst_name);
    vanilla_json["jar"] = json!(inst_name);

    let install_arguments = profile_json["versionInfo"]["minecraftArguments"]
      .as_str()
      .ok_or(SJMCLError(
        "missing minecraftArguments in install_profile.json".to_string(),
      ))?;

    vanilla_json["minecraftArguments"] = json!(install_arguments);

    if let Some(first_lib) = libraries.get(0) {
      let name = first_lib["name"]
        .as_str()
        .ok_or(SJMCLError("lib without name".to_string()))?;
      let url = if first_lib["url"].is_null() {
        "https://libraries.minecraft.net/"
      } else {
        first_lib["url"]
          .as_str()
          .ok_or(SJMCLError(first_lib.to_string()))?
      };

      add_library_entry(vanilla_json, name, url)?;

      let rel = convert_library_name_to_path(&name.to_string(), None)?;

      let parts: Vec<&str> = name.split(':').collect();
      let artifact_id = parts[1];
      let version = parts[2];

      let file_name = format!("{}-{}-universal.jar", artifact_id, version);

      let mut file = archive.by_name(&file_name)?;

      let dest_path = lib_dir.join(&rel);

      if let Some(parent) = dest_path.parent() {
        if !parent.exists() {
          fs::create_dir_all(parent)?;
        }
      }

      let mut output = File::create(&dest_path)?;

      std::io::copy(&mut file, &mut output)?;
    } else {
      return Err(SJMCLError(
        "No libraries found in install_profile.json".to_string(),
      ));
    }

    let mut task_params = vec![];
    for lib in libraries.iter().skip(1) {
      let name = lib["name"]
        .as_str()
        .ok_or(SJMCLError("lib without name".to_string()))?;
      let url = if lib["url"].is_null() {
        "https://libraries.minecraft.net/"
      } else {
        lib["url"].as_str().ok_or(SJMCLError(lib.to_string()))?
      };

      add_library_entry(vanilla_json, name, url)?;

      let rel = convert_library_name_to_path(&name.to_string(), None)?;
      let src = url::Url::parse(url)?.join(&rel)?;
      task_params.push(PTaskParam::Download(DownloadParam {
        src,
        dest: lib_dir.join(&rel),
        filename: None,
        sha1: None,
      }));
    }

    schedule_progressive_task_group(
      app,
      format!("neoforge-libraries-download:{inst_name}"),
      task_params,
      true,
    )
    .await?;
  }

  Ok(())
}

pub async fn finish_neoforge_install(
  app: AppHandle,
  loader: &ModLoader,
  inst_name: &str,
  lib_dir: PathBuf,
  vanilla_json: &mut Value,
) -> SJMCLResult<()> {
  let installer_coord = format!("net.neoforged:neoforge:{}-installer", loader.version);
  let installer_rel = convert_library_name_to_path(&installer_coord, None)?;
  let installer_path = lib_dir.join(&installer_rel);
  let (content, version) = {
    let file = File::open(&installer_path)?;
    let mut archive = ZipArchive::new(file)?;

    let mut s = String::new();
    {
      let mut install_profile = archive.by_name("install_profile.json")?;
      install_profile.read_to_string(&mut s)?;
    }

    let mut t = String::new();
    {
      let mut version_file = archive.by_name("version.json")?;
      version_file.read_to_string(&mut t)?;
    }

    (s, t)
  };

  let profile_json: serde_json::Value = serde_json::from_str(&content)?;
  let version_json: serde_json::Value = serde_json::from_str(&version)?;

  let main_class = version_json["mainClass"].as_str().unwrap();
  let libraries = profile_json["libraries"].as_array().unwrap();

  vanilla_json["mainClass"] = json!(main_class);
  vanilla_json["id"] = json!(inst_name);
  vanilla_json["jar"] = json!(inst_name);

  let nf_game_args = version_json["arguments"]["game"]
    .as_array()
    .ok_or(SJMCLError(
      "neoforge version.json 缺少 arguments.game".into(),
    ))?;

  let v_game_args = vanilla_json["arguments"]["game"]
    .as_array_mut()
    .ok_or(SJMCLError(
      "vanilla version.json 缺少 arguments.game".into(),
    ))?;

  for arg in nf_game_args {
    v_game_args.push(arg.clone());
  }

  let mut task_params = vec![];
  for lib in libraries {
    let name = lib["name"]
      .as_str()
      .ok_or(SJMCLError("lib without name".to_string()))?;
    let url = lib["downloads"]["artifact"]["url"]
      .as_str()
      .ok_or(SJMCLError(lib.to_string()))?;

    add_library_entry(vanilla_json, name, url)?;

    let rel = convert_library_name_to_path(&name.to_string(), None)?;
    task_params.push(PTaskParam::Download(DownloadParam {
      src: url::Url::parse(url)?,
      dest: lib_dir.join(&rel),
      filename: None,
      sha1: None,
    }));
  }

  schedule_progressive_task_group(
    app,
    format!("neoforge-libraries-download:{inst_name}"),
    task_params,
    true,
  )
  .await?;
  Ok(())
}
