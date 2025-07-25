use reqwest::redirect::Policy;
use reqwest::{Client, Error};
use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;
use url::Url;
use zip::ZipArchive;

use crate::instance::helpers::client_json::{
  LaunchArgumentTemplate, LibrariesValue, McClientInfo, PatchesInfo,
};
use crate::instance::helpers::misc::{get_instance_game_config, get_instance_subdir_paths};
use crate::instance::helpers::mods::forge::InstallProfile;
use crate::instance::helpers::mods::legacy_forge::LegacyInstallProfile;
use crate::instance::models::misc::{Instance, InstanceError, InstanceSubdirType, ModLoaderStatus};
use crate::launch::helpers::file_validator::{parse_library_name, LibraryParts};
use crate::launch::helpers::{
  file_validator::convert_library_name_to_path, jre_selector::select_java_runtime,
};
use crate::launcher_config::models::JavaInfo;
use crate::resource::helpers::misc::convert_url_to_target_source;
use crate::{
  error::{SJMCLError, SJMCLResult},
  instance::models::misc::{ModLoader, ModLoaderType},
  resource::{
    helpers::misc::get_download_api,
    models::{ResourceType, SourceType},
  },
  tasks::{commands::schedule_progressive_task_group, download::DownloadParam, PTaskParam},
};

pub fn add_library_entry(
  libraries: &mut Vec<LibrariesValue>,
  lib_path: &str,
  params: Option<LibrariesValue>,
) -> SJMCLResult<()> {
  let LibraryParts {
    path,
    pack_name,
    pack_version: _pack_version,
    classifier,
    extension,
  } = parse_library_name(lib_path, None)?;

  if let Some(pos) = libraries.iter().position(|item| {
    if let Ok(parts) = parse_library_name(&item.name, None) {
      parts.path == path
        && parts.pack_name == pack_name
        && parts.classifier == classifier
        && parts.extension == extension
    } else {
      false
    }
  }) {
    libraries[pos] = LibrariesValue {
      name: lib_path.to_string(),
      ..params.unwrap_or_default()
    }
  } else {
    libraries.push(LibrariesValue {
      name: lib_path.to_string(),
      ..params.unwrap_or_default()
    });
  }

  Ok(())
}

async fn fetch_bmcl_forge_installer_url(
  root: Url,
  game_version: &str,
  loader_ver: &str,
  branch: Option<&str>,
) -> Result<String, Error> {
  let client = Client::builder().redirect(Policy::limited(5)).build()?;

  let response = client
    .get(root)
    .query(&[
      ("mcversion", game_version),
      ("version", loader_ver),
      ("branch", branch.unwrap_or("")),
      ("category", "installer"),
      ("format", "jar"),
    ])
    .send()
    .await?;

  let final_url = response.url().to_string();
  Ok(final_url)
}

pub async fn install_mod_loader(
  app: AppHandle,
  priority: &[SourceType],
  game_version: &str,
  loader: &ModLoader,
  lib_dir: PathBuf,
  client_info: &mut McClientInfo,
  task_params: &mut Vec<PTaskParam>,
) -> SJMCLResult<()> {
  match loader.loader_type {
    ModLoaderType::Fabric => {
      install_fabric_loader(
        app,
        priority,
        game_version,
        loader,
        lib_dir,
        client_info,
        task_params,
      )
      .await
    }
    ModLoaderType::Forge => {
      install_forge_loader(priority, game_version, loader, lib_dir, task_params).await
    }
    ModLoaderType::NeoForge => {
      install_neoforge_loader(priority, loader, lib_dir, task_params).await
    }
    _ => Err(InstanceError::UnsupportedModLoader.into()),
  }
}

async fn install_fabric_loader(
  app: AppHandle,
  priority: &[SourceType],
  game_version: &str,
  loader: &ModLoader,
  lib_dir: PathBuf,
  client_info: &mut McClientInfo,
  task_params: &mut Vec<PTaskParam>,
) -> SJMCLResult<()> {
  let client = app.state::<reqwest::Client>();
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

  client_info.main_class = main_class.to_string();

  let mut new_patch = PatchesInfo {
    id: "fabric".to_string(),
    version: loader_ver.to_string(),
    priority: 30000,
    ..Default::default()
  };

  let maven_root = get_download_api(priority[0], ResourceType::FabricMaven)?;

  add_library_entry(&mut client_info.libraries, loader_path, None)?;
  add_library_entry(&mut client_info.libraries, int_path, None)?;
  add_library_entry(&mut new_patch.libraries, loader_path, None)?;
  add_library_entry(&mut new_patch.libraries, int_path, None)?;

  let launcher_meta = &meta["launcherMeta"]["libraries"];
  for side in ["common", "server", "client"] {
    if let Some(arr) = launcher_meta.get(side).and_then(|v| v.as_array()) {
      for item in arr {
        let name = item["name"].as_str().unwrap();
        add_library_entry(&mut client_info.libraries, name, None)?;
        add_library_entry(&mut new_patch.libraries, name, None)?;
      }
    }
  }

  client_info.patches.push(new_patch);

  let mut push_task = |coord: &str, url_root: &str| -> SJMCLResult<()> {
    let rel: String = convert_library_name_to_path(coord, None)?;
    let src = convert_url_to_target_source(
      &Url::parse(url_root)?.join(&rel)?,
      &[ResourceType::FabricMaven, ResourceType::Libraries],
      &priority[0],
    )?;
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

  Ok(())
}

async fn install_neoforge_loader(
  priority: &[SourceType],
  loader: &ModLoader,
  lib_dir: PathBuf,
  task_params: &mut Vec<PTaskParam>,
) -> SJMCLResult<()> {
  let loader_ver = &loader.version;

  let (installer_url, installer_coord) = if loader_ver.starts_with("1.20.1-") {
    (
      get_download_api(SourceType::Official, ResourceType::NeoforgeInstall)?.join(&format!(
        "net/neoforged/forge/{v}/forge-{v}-installer.jar",
        v = loader_ver
      ))?,
      format!("net.neoforged:forge:{}-installer", loader.version),
    )
  } else {
    let root = get_download_api(priority[0], ResourceType::NeoforgeInstall)?;
    (
      match priority.first().unwrap_or(&SourceType::Official) {
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
      },
      format!("net.neoforged:neoforge:{}-installer", loader.version),
    )
  };

  let installer_rel = convert_library_name_to_path(&installer_coord, None)?;
  let installer_path = lib_dir.join(&installer_rel);

  task_params.push(PTaskParam::Download(DownloadParam {
    src: installer_url,
    dest: installer_path.clone(),
    filename: None,
    sha1: None,
  }));

  Ok(())
}

async fn install_forge_loader(
  priority: &[SourceType],
  game_version: &str,
  loader: &ModLoader,
  lib_dir: PathBuf,
  task_params: &mut Vec<PTaskParam>,
) -> SJMCLResult<()> {
  let loader_ver = &loader.version;

  let root = get_download_api(priority[0], ResourceType::ForgeInstall)?;

  let installer_url = match priority.first().unwrap_or(&SourceType::Official) {
    SourceType::Official => {
      let full_ver = vec![
        game_version,
        loader_ver,
        loader.branch.as_ref().unwrap_or(&"".to_string()),
      ]
      .into_iter()
      .filter(|s| !s.is_empty())
      .collect::<Vec<_>>()
      .join("-");

      root.join(&format!("{full_ver}/forge-{full_ver}-installer.jar"))?
    }
    SourceType::BMCLAPIMirror => Url::parse(
      &fetch_bmcl_forge_installer_url(root, game_version, loader_ver, loader.branch.as_deref())
        .await?,
    )?,
  };

  let installer_coord = format!("net.minecraftforge:forge:{}-installer", loader.version);
  let installer_rel = convert_library_name_to_path(&installer_coord, None)?;
  let installer_path = lib_dir.join(&installer_rel);

  task_params.push(PTaskParam::Download(DownloadParam {
    src: installer_url,
    dest: installer_path.clone(),
    filename: None,
    sha1: None,
  }));

  Ok(())
}

pub async fn download_forge_libraries(
  app: &AppHandle,
  priority: &[SourceType],
  instance: &Instance,
  client_info: &McClientInfo,
) -> SJMCLResult<()> {
  let subdirs = get_instance_subdir_paths(
    app,
    instance,
    &[&InstanceSubdirType::Root, &InstanceSubdirType::Libraries],
  )
  .ok_or(InstanceError::InvalidSourcePath)?;
  let [root_dir, lib_dir] = subdirs.as_slice() else {
    return Err(InstanceError::InvalidSourcePath.into());
  };
  let mut task_params = vec![];

  let mut client_info = client_info.clone();

  let installer_coord = format!(
    "net.minecraftforge:forge:{}-installer",
    instance.mod_loader.version
  );
  let installer_rel = convert_library_name_to_path(&installer_coord, None)?;
  let installer_path = lib_dir.join(&installer_rel);
  let bin_patch = lib_dir.join(convert_library_name_to_path(
    &format!(
      "net.minecraftforge:forge:{}:clientdata@lzma",
      instance.mod_loader.version
    ),
    None,
  )?);
  let file = File::open(&installer_path)?;
  let mut archive = ZipArchive::new(file)?;
  let (install_profile, version) = {
    // Extract maven folder contents to lib_dir
    for i in 0..archive.len() {
      let mut file = archive.by_index(i)?;
      let outpath = match file.enclosed_name() {
        Some(path) => {
          if path.starts_with("maven/") {
            // Remove "maven/" prefix and join with lib_dir
            let relative_path = path.strip_prefix("maven/").unwrap();
            lib_dir.join(relative_path)
          } else if path == PathBuf::from("data/client.lzma") {
            bin_patch.clone()
          } else {
            continue;
          }
        }
        None => continue,
      };

      if file.name().ends_with('/') {
        // Create directory
        fs::create_dir_all(&outpath)?;
      } else {
        // Create parent directories if they don't exist
        if let Some(p) = outpath.parent() {
          if !p.exists() {
            fs::create_dir_all(p)?;
          }
        }

        // Extract file
        let mut outfile = File::create(&outpath)?;
        std::io::copy(&mut file, &mut outfile)?;
      }
    }

    let mut s = String::new();
    if let Ok(mut install_profile) = archive.by_name("install_profile.json") {
      install_profile.read_to_string(&mut s)?;
    }

    let mut t = String::new();
    if let Ok(mut version_file) = archive.by_name("version.json") {
      version_file.read_to_string(&mut t)?;
    }

    (s, t)
  };

  if install_profile.is_empty() {
    return Err(InstanceError::InstallProfileParseError.into());
  }

  if !version.is_empty() {
    // It's modern version Forge installer

    let mut profile: InstallProfile = serde_json::from_str(&install_profile)
      .map_err(|_| InstanceError::InstallProfileParseError)?;

    let mut args_map = HashMap::<String, String>::new();
    args_map.insert(
      "{MINECRAFT_JAR}".into(),
      instance
        .version_path
        .join(format!("{}.jar", instance.name))
        .to_string_lossy()
        .to_string(),
    );
    args_map.insert("{BINPATCH}".into(), bin_patch.to_string_lossy().to_string());
    args_map.insert(
      "{INSTALLER}".into(),
      installer_path.to_string_lossy().to_string(),
    );
    args_map.insert("{SIDE}".into(), "client".to_string());
    args_map.insert("{ROOT}".into(), root_dir.to_string_lossy().to_string());
    for (key, value) in profile.data.iter() {
      if args_map.contains_key(&format!("{{{key}}}")) {
        continue;
      }
      let mut value_client = value.client.clone();
      if value_client.starts_with('[') && value_client.ends_with(']') {
        value_client = value_client
          .trim_start_matches('[')
          .trim_end_matches(']')
          .to_string();
        value_client = lib_dir
          .join(convert_library_name_to_path(&value_client, None)?)
          .to_string_lossy()
          .to_string();
      }
      args_map.insert(format!("{{{key}}}"), value_client);
    }

    for processor in profile.processors.iter_mut() {
      if processor.args.contains(&"DOWNLOAD_MOJMAPS".to_string()) {
        if let Some(mojmaps) = args_map.get("{MOJMAPS}") {
          if let Some(client_mappings) = client_info.downloads.get("client_mappings") {
            task_params.push(PTaskParam::Download(DownloadParam {
              src: client_mappings.url.parse()?,
              dest: lib_dir.join(mojmaps),
              filename: None,
              sha1: Some(client_mappings.sha1.clone()),
            }));
          }
        }
        processor.args.clear();
        continue;
      }

      processor.jar = lib_dir
        .join(convert_library_name_to_path(&processor.jar, None)?)
        .to_string_lossy()
        .to_string();

      for class in processor.classpath.iter_mut() {
        *class = lib_dir
          .join(convert_library_name_to_path(class, None)?)
          .to_string_lossy()
          .to_string();
      }

      for arg in processor.args.iter_mut() {
        if arg.starts_with('[') && arg.ends_with(']') {
          *arg = arg
            .trim_start_matches('[')
            .trim_end_matches(']')
            .to_string();
          *arg = lib_dir
            .join(convert_library_name_to_path(arg, None)?)
            .to_string_lossy()
            .to_string();
        }
        for (key, value) in &args_map {
          *arg = arg.replace(key, value);
        }
      }
    }

    profile.processors.retain(|processor| {
      if let Some(sides) = &processor.sides {
        sides.contains(&"client".to_string())
      } else {
        !processor.args.is_empty()
      }
    });

    fs::write(
      instance.version_path.join("install_profile.json"),
      &serde_json::to_vec_pretty(&profile)?,
    )?;

    let forge_info: McClientInfo = serde_json::from_str(&version)?;

    let main_class = forge_info.main_class;
    client_info.main_class = main_class.to_string();

    for lib in forge_info.libraries.iter() {
      let name = &lib.name;
      add_library_entry(&mut client_info.libraries, name, Some(lib.clone()))?;

      let url = lib
        .downloads
        .as_ref()
        .and_then(|d| d.artifact.as_ref())
        .map(|a| a.url.as_str())
        .unwrap_or_default();
      if url.is_empty() {
        continue;
      }

      task_params.push(PTaskParam::Download(DownloadParam {
        src: convert_url_to_target_source(
          &Url::parse(url)?,
          &[
            ResourceType::ForgeMaven,
            ResourceType::ForgeMavenNew,
            ResourceType::Libraries,
          ],
          &priority[0],
        )?,
        dest: lib_dir.join(&convert_library_name_to_path(name, None)?),
        filename: None,
        sha1: None,
      }));
    }

    let (arguments, minecraft_arguments) = if let Some(v_args) = client_info.arguments {
      let nf_args = forge_info
        .arguments
        .ok_or(InstanceError::ModLoaderVersionParseError)?;

      let new_args = LaunchArgumentTemplate {
        game: [v_args.game, nf_args.game].concat(),
        jvm: [v_args.jvm, nf_args.jvm].concat(),
      };
      (Some(new_args), None)
    } else {
      (None, forge_info.minecraft_arguments)
    };
    client_info.arguments = arguments.clone();
    client_info.minecraft_arguments = minecraft_arguments.clone();
    client_info.patches.push(PatchesInfo {
      id: "forge".to_string(),
      version: forge_info.id.clone(),
      priority: 30000,
      inherits_from: forge_info.inherits_from.clone(),
      main_class: main_class.clone(),
      arguments,
      minecraft_arguments,
      ..Default::default()
    });

    for lib in profile.libraries.iter() {
      let name = &lib.name;
      let url = lib
        .downloads
        .as_ref()
        .and_then(|d| d.artifact.as_ref())
        .map(|a| a.url.as_str())
        .unwrap_or_default();

      if url.is_empty() {
        continue;
      }

      let rel = convert_library_name_to_path(&name.to_string(), None)?;
      task_params.push(PTaskParam::Download(DownloadParam {
        src: convert_url_to_target_source(
          &Url::parse(url)?,
          &[
            ResourceType::ForgeMaven,
            ResourceType::ForgeMavenNew,
            ResourceType::Libraries,
          ],
          &priority[0],
        )?,
        dest: lib_dir.join(&rel),
        filename: None,
        sha1: None,
      }));
    }
  } else {
    // It's legacy version Forge installer

    let profile: LegacyInstallProfile = serde_json::from_str(&install_profile)
      .map_err(|_| InstanceError::InstallProfileParseError)?;

    let main_class = profile.version_info.main_class;
    let libraries = profile.version_info.libraries;

    client_info.main_class = main_class.to_string();

    let mut new_patch = PatchesInfo {
      id: "forge".to_string(),
      version: instance.mod_loader.version.clone(),
      priority: 30000,
      main_class: main_class.to_string(),
      inherits_from: Some(profile.version_info.inherits_from),
      arguments: None,
      minecraft_arguments: Some(profile.version_info.minecraft_arguments.clone()),
      release_time: profile.version_info.release_time,
      time: profile.version_info.time,
      type_: profile.version_info.type_,
      assets: profile.version_info.assets,

      ..Default::default()
    };

    client_info.minecraft_arguments = Some(profile.version_info.minecraft_arguments.clone());

    let mut file = archive.by_name(&profile.install.file_path)?;
    let dest_path = lib_dir.join(convert_library_name_to_path(&profile.install.path, None)?);
    if let Some(parent) = dest_path.parent() {
      if !parent.exists() {
        fs::create_dir_all(parent)?;
      }
    }
    let mut output = File::create(&dest_path)?;
    std::io::copy(&mut file, &mut output)?;

    for lib in libraries.iter() {
      let name = lib.name.clone();

      add_library_entry(&mut client_info.libraries, &name, None)?;
      add_library_entry(&mut new_patch.libraries, &name, None)?;

      if name == profile.install.path {
        continue;
      }

      let url = if lib.url.is_none() {
        continue;
      } else {
        lib.url.clone().unwrap()
      };

      let rel = convert_library_name_to_path(&name, None)?;
      let src = convert_url_to_target_source(
        &Url::parse(&url)?.join(&rel)?,
        &[
          ResourceType::ForgeMaven,
          ResourceType::ForgeMavenNew,
          ResourceType::Libraries,
        ],
        &priority[0],
      )?;
      task_params.push(PTaskParam::Download(DownloadParam {
        src,
        dest: lib_dir.join(&rel),
        filename: None,
        sha1: None,
      }));
    }
    client_info.patches.push(new_patch);
  }
  schedule_progressive_task_group(
    app.clone(),
    format!("forge-libraries?{}", instance.id),
    task_params,
    true,
  )
  .await?;

  let vjson_path = instance
    .version_path
    .join(format!("{}.json", instance.name));
  fs::write(vjson_path, serde_json::to_vec_pretty(&client_info)?)?;

  Ok(())
}

pub async fn download_neoforge_libraries(
  app: &AppHandle,
  priority: &[SourceType],
  instance: &Instance,
  client_info: &McClientInfo,
) -> SJMCLResult<()> {
  let subdirs = get_instance_subdir_paths(
    app,
    instance,
    &[&InstanceSubdirType::Root, &InstanceSubdirType::Libraries],
  )
  .ok_or(InstanceError::InvalidSourcePath)?;
  let [root_dir, lib_dir] = subdirs.as_slice() else {
    return Err(InstanceError::InvalidSourcePath.into());
  };
  let mut task_params = vec![];

  let mut client_info = client_info.clone();

  let name = if instance.mod_loader.version.starts_with("1.20.1-") {
    "forge"
  } else {
    "neoforge"
  };

  let installer_coord = format!(
    "net.neoforged:{name}:{}-installer",
    instance.mod_loader.version
  );
  let installer_rel = convert_library_name_to_path(&installer_coord, None)?;
  let installer_path = lib_dir.join(&installer_rel);
  let bin_patch = lib_dir.join(convert_library_name_to_path(
    &format!(
      "net.neoforged:{name}:{}:clientdata@lzma",
      instance.mod_loader.version
    ),
    None,
  )?);
  let (content, version) = {
    let file = File::open(&installer_path)?;
    let mut archive = ZipArchive::new(file)?;

    // Extract maven folder contents to lib_dir
    for i in 0..archive.len() {
      let mut file = archive.by_index(i)?;
      let outpath = match file.enclosed_name() {
        Some(path) => {
          if path.starts_with("maven/") {
            // Remove "maven/" prefix and join with lib_dir
            let relative_path = path.strip_prefix("maven/").unwrap();
            lib_dir.join(relative_path)
          } else if path == PathBuf::from("data/client.lzma") {
            bin_patch.clone()
          } else {
            continue;
          }
        }
        None => continue,
      };

      if file.name().ends_with('/') {
        // Create directory
        fs::create_dir_all(&outpath)?;
      } else {
        // Create parent directories if they don't exist
        if let Some(p) = outpath.parent() {
          if !p.exists() {
            fs::create_dir_all(p)?;
          }
        }

        // Extract file
        let mut outfile = File::create(&outpath)?;
        std::io::copy(&mut file, &mut outfile)?;
      }
    }

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

  let mut profile: InstallProfile = serde_json::from_str(&content)?;

  let mut args_map = HashMap::<String, String>::new();
  args_map.insert(
    "{MINECRAFT_JAR}".into(),
    instance
      .version_path
      .join(format!("{}.jar", instance.name))
      .to_string_lossy()
      .to_string(),
  );
  args_map.insert("{BINPATCH}".into(), bin_patch.to_string_lossy().to_string());
  args_map.insert(
    "{INSTALLER}".into(),
    installer_path.to_string_lossy().to_string(),
  );
  args_map.insert("{SIDE}".into(), "client".to_string());
  args_map.insert("{ROOT}".into(), root_dir.to_string_lossy().to_string());
  for (key, value) in profile.data.iter() {
    if args_map.contains_key(&format!("{{{key}}}")) {
      continue;
    }
    let mut value_client = value.client.clone();
    if value_client.starts_with('[') && value_client.ends_with(']') {
      value_client = value_client
        .trim_start_matches('[')
        .trim_end_matches(']')
        .to_string();
      value_client = lib_dir
        .join(convert_library_name_to_path(&value_client, None)?)
        .to_string_lossy()
        .to_string();
    }
    args_map.insert(format!("{{{key}}}"), value_client);
  }

  for processor in profile.processors.iter_mut() {
    if processor.args.contains(&"DOWNLOAD_MOJMAPS".to_string()) {
      if let Some(mojmaps) = args_map.get("{MOJMAPS}") {
        if let Some(client_mappings) = client_info.downloads.get("client_mappings") {
          task_params.push(PTaskParam::Download(DownloadParam {
            src: client_mappings.url.parse()?,
            dest: lib_dir.join(mojmaps),
            filename: None,
            sha1: Some(client_mappings.sha1.clone()),
          }));
        }
      }
      processor.args.clear();
      continue;
    }

    processor.jar = lib_dir
      .join(convert_library_name_to_path(&processor.jar, None)?)
      .to_string_lossy()
      .to_string();

    for class in processor.classpath.iter_mut() {
      *class = lib_dir
        .join(convert_library_name_to_path(class, None)?)
        .to_string_lossy()
        .to_string();
    }

    for arg in processor.args.iter_mut() {
      if arg.starts_with('[') && arg.ends_with(']') {
        *arg = arg
          .trim_start_matches('[')
          .trim_end_matches(']')
          .to_string();
        *arg = lib_dir
          .join(convert_library_name_to_path(arg, None)?)
          .to_string_lossy()
          .to_string();
      }
      for (key, value) in &args_map {
        *arg = arg.replace(key, value);
      }
    }
  }

  profile.processors.retain(|processor| {
    if let Some(sides) = &processor.sides {
      sides.contains(&"client".to_string())
    } else {
      !processor.args.is_empty()
    }
  });

  fs::write(
    instance.version_path.join("install_profile.json"),
    &serde_json::to_vec_pretty(&profile)?,
  )?;

  let neoforge_info: McClientInfo = serde_json::from_str(&version)?;

  let main_class = neoforge_info.main_class;
  client_info.main_class = main_class.to_string();

  for lib in neoforge_info.libraries.iter() {
    let name = &lib.name;
    add_library_entry(&mut client_info.libraries, name, Some(lib.clone()))?;

    let url = lib
      .downloads
      .as_ref()
      .and_then(|d| d.artifact.as_ref())
      .map(|a| a.url.as_str())
      .unwrap_or_default();
    if url.is_empty() {
      continue;
    }

    task_params.push(PTaskParam::Download(DownloadParam {
      src: convert_url_to_target_source(
        &Url::parse(url)?,
        &[ResourceType::NeoforgeMaven, ResourceType::Libraries],
        &priority[0],
      )?,
      dest: lib_dir.join(&convert_library_name_to_path(name, None)?),
      filename: None,
      sha1: None,
    }));
  }

  let nf_args = neoforge_info
    .arguments
    .ok_or(InstanceError::ModLoaderVersionParseError)?;
  let v_args = client_info
    .arguments
    .clone()
    .ok_or(InstanceError::ClientJsonParseError)?;
  let new_args = LaunchArgumentTemplate {
    game: [v_args.game, nf_args.game].concat(),
    jvm: [v_args.jvm, nf_args.jvm].concat(),
  };
  client_info.arguments = Some(new_args.clone());
  client_info.patches.push(PatchesInfo {
    id: "neoforge".to_string(),
    version: neoforge_info.id.clone(),
    priority: 30000,
    inherits_from: neoforge_info.inherits_from.clone(),
    main_class: main_class.clone(),
    arguments: Some(new_args.clone()),
    ..Default::default()
  });

  for lib in profile.libraries.iter() {
    let name = &lib.name;
    let url = lib
      .downloads
      .as_ref()
      .and_then(|d| d.artifact.as_ref())
      .map(|a| a.url.as_str())
      .unwrap_or("");

    if url.is_empty() {
      continue;
    }

    let rel = convert_library_name_to_path(&name.to_string(), None)?;
    task_params.push(PTaskParam::Download(DownloadParam {
      src: convert_url_to_target_source(
        &Url::parse(url)?,
        &[ResourceType::NeoforgeMaven, ResourceType::Libraries],
        &priority[0],
      )?,
      dest: lib_dir.join(&rel),
      filename: None,
      sha1: None,
    }));
  }

  schedule_progressive_task_group(
    app.clone(),
    format!("neoforge-libraries?{}", instance.id),
    task_params,
    true,
  )
  .await?;

  let vjson_path = instance
    .version_path
    .join(format!("{}.json", instance.name));
  fs::write(vjson_path, serde_json::to_vec_pretty(&client_info)?)?;
  Ok(())
}

pub async fn execute_processors(
  app: &AppHandle,
  instance: &Instance,
  client_info: &McClientInfo,
  install_profile: &InstallProfile,
) -> SJMCLResult<()> {
  let mut instance = instance.clone();
  instance.mod_loader.status = ModLoaderStatus::Installing;
  instance.save_json_cfg().await?;

  let javas_state = app.state::<Mutex<Vec<JavaInfo>>>();
  let javas = javas_state.lock()?.clone();

  let game_config = get_instance_game_config(app, &instance);

  let selected_java = select_java_runtime(
    app,
    &game_config.game_java,
    &javas,
    &instance,
    client_info.java_version.major_version,
  )
  .await?;
  println!("Java: {}", selected_java.exec_path.clone());

  for processor in &install_profile.processors {
    println!("[{}] Processing: {}", instance.name, processor.jar);
    let mut archive = ZipArchive::new(File::open(processor.jar.clone())?)?;
    let mut manifest = archive.by_name("META-INF/MANIFEST.MF")?;
    let mut manifest_content = String::new();
    manifest.read_to_string(&mut manifest_content)?;
    let main_class = manifest_content
      .lines()
      .find_map(|line| {
        if line.starts_with("Main-Class: ") {
          Some(line.trim_start_matches("Main-Class: ").trim())
        } else {
          None
        }
      })
      .ok_or(InstanceError::MainClassNotFound)?;
    let mut cmd_base = Command::new(selected_java.exec_path.clone());
    #[cfg(target_os = "windows")]
    {
      use std::os::windows::process::CommandExt;
      cmd_base.creation_flags(0x08000000);
    }

    let processor_path = instance.version_path.join(&processor.jar);
    let mut classpath_arr = processor.classpath.clone();
    classpath_arr.push(processor_path.to_string_lossy().to_string());

    #[cfg(target_os = "windows")]
    let classpath = classpath_arr.join(";");
    #[cfg(not(target_os = "windows"))]
    let classpath = classpath_arr.join(":");

    let args = &processor.args;

    cmd_base.arg("-cp").arg(&classpath).arg(main_class);

    for arg in args {
      cmd_base.arg(arg);
    }

    println!(
      "[{}] Executing processor: {} with args: {:?}",
      instance.name,
      processor_path.display(),
      cmd_base
    );

    let output = cmd_base.output()?;

    if !output.stdout.is_empty() {
      println!(
        "[{}] Processor stdout: {}",
        instance.name,
        String::from_utf8_lossy(&output.stdout)
      );
    }

    if !output.stderr.is_empty() {
      println!(
        "[{}] Processor stderr: {}",
        instance.name,
        String::from_utf8_lossy(&output.stderr)
      );
    }

    if !output.status.success() {
      println!(
        "[{}] Processor failed with exit code: {:?}",
        instance.name,
        output.status.code()
      );
      return Err(InstanceError::ProcessorExecutionFailed.into());
    }
  }

  Ok(())
}
