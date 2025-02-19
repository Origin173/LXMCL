use super::{
  super::utils::path::{get_files_with_regex, get_subdirectories},
  helpers::{
    get_instance_subdir_path, get_resource_pack_info_from_zip, refresh_and_update_instances,
  },
  models::{
    GameServerInfo, Instance, InstanceError, InstanceSubdirType, ResourcePackInfo, SchematicInfo,
    ScreenshotInfo, ShaderPackInfo, WorldInfo,
  },
};
use crate::error::SJMCLResult;
use quartz_nbt::NbtCompound;
use quartz_nbt::{
  io::{read_nbt, Flavor},
  NbtList,
};
use regex::RegexBuilder;
use serde_json::Value;
use std::{
  fs::File,
  io::{Cursor, Read},
  sync::Mutex,
  time::SystemTime,
};
use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;
use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub async fn retrive_instance_list(app: AppHandle) -> SJMCLResult<Vec<Instance>> {
  refresh_and_update_instances(&app).await; // firstly refresh and update
  let binding = app.state::<Mutex<Vec<Instance>>>();
  let state = binding.lock()?;
  Ok(state.clone())
}

#[tauri::command]
pub fn open_instance_subdir(
  app: AppHandle,
  instance_id: usize,
  dir_type: InstanceSubdirType,
) -> SJMCLResult<()> {
  let subdir_path = match get_instance_subdir_path(&app, instance_id, &dir_type) {
    Some(path) => path,
    None => return Err(InstanceError::SubdirTypeNotFound.into()),
  };

  match app.shell().open(subdir_path.to_str().unwrap(), None) {
    Ok(_) => Ok(()),
    Err(_) => Err(InstanceError::ExecOpenDirError.into()),
  }
}

#[tauri::command]
pub async fn retrive_world_list(app: AppHandle, instance_id: usize) -> SJMCLResult<Vec<WorldInfo>> {
  let worlds_dir = match get_instance_subdir_path(&app, instance_id, &InstanceSubdirType::Saves) {
    Some(path) => path,
    None => return Ok(Vec::new()),
  };

  let world_dirs = match get_subdirectories(worlds_dir) {
    Ok(val) => val,
    Err(e) => return Err(e),
  };

  let mut world_list: Vec<WorldInfo> = Vec::new();
  // TODO: async read
  for path in world_dirs {
    let name = path.file_name().unwrap().to_str().unwrap();

    let icon_path = path.join("icon.png");
    let nbt_path = path.join("level.dat");

    if let Ok(mut nbt_file) = File::open(nbt_path) {
      let mut nbt_bytes = Vec::new();
      if nbt_file.read_to_end(&mut nbt_bytes).is_err() {
        continue;
      }
      let nbt_result = read_nbt(&mut Cursor::new(nbt_bytes), Flavor::GzCompressed);
      if nbt_result.is_err() {
        #[cfg(debug_assertions)]
        println!("nbt read error: {}", nbt_result.err().unwrap());
        continue;
      }
      let nbt = nbt_result.unwrap().0;
      let data = nbt.get::<_, &NbtCompound>("Data");
      if data.is_err() {
        #[cfg(debug_assertions)]
        println!("nbt not contains 'Data'");
        continue;
      }
      let data = data.unwrap();
      let last_played: i64;
      if let Ok(val) = data.get::<_, &i64>("LastPlayed") {
        last_played = *val / 1000;
      } else {
        last_played = 0;
      }
      let mut difficulty: u8;
      if let Ok(val) = data.get::<_, &u8>("Difficulty") {
        difficulty = *val;
      } else {
        difficulty = 2;
      }
      if let Ok(val) = data.get::<_, &u8>("hardcore") {
        if *val != 0 {
          difficulty = 4;
        }
      }
      const DIFFICULTY_STR: [&str; 5] = ["peaceful", "easy", "normal", "hard", "hardcore"];
      if difficulty >= DIFFICULTY_STR.len() as u8 {
        continue;
      }
      let gametype: i32;
      if let Ok(val) = data.get::<_, &i32>("GameType") {
        gametype = *val;
      } else {
        gametype = 0;
      }
      const GAMEMODE_STR: [&str; 4] = ["survival", "creative", "adventure", "spectator"];
      if gametype < 0 || gametype >= GAMEMODE_STR.len() as i32 {
        continue;
      }
      world_list.push(WorldInfo {
        name: name.to_string(),
        last_played_at: last_played,
        gamemode: GAMEMODE_STR[gametype as usize].to_string(),
        difficulty: DIFFICULTY_STR[difficulty as usize].to_string(),
        icon_src: icon_path,
        dir_path: path,
      });
    }
  }
  Ok(world_list)
}

#[tauri::command]
pub async fn retrive_game_server_list(
  app: AppHandle,
  instance_id: usize,
  query_online: bool,
) -> SJMCLResult<Vec<GameServerInfo>> {
  // query_online is false, return local data from nbt (servers.dat)
  let mut game_servers: Vec<GameServerInfo> = Vec::new();
  let game_root_dir = match get_instance_subdir_path(&app, instance_id, &InstanceSubdirType::Root) {
    Some(path) => path,
    None => return Ok(Vec::new()),
  };

  let nbt_path = game_root_dir.join("servers.dat");
  let mut nbt_file = match File::open(&nbt_path) {
    Ok(file) => file,
    Err(_) => return Ok(Vec::new()),
  };

  let mut nbt_bytes = Vec::new();
  if nbt_file.read_to_end(&mut nbt_bytes).is_err() {
    return Err(InstanceError::ServerNbtReadError.into());
  }

  let (nbt, _) = match read_nbt(&mut Cursor::new(nbt_bytes), Flavor::Uncompressed) {
    Ok(result) => result,
    Err(_) => return Err(InstanceError::ServerNbtReadError.into()),
  };

  let servers = match nbt.get::<_, &NbtList>("servers") {
    Ok(list) => list,
    Err(_) => return Err(InstanceError::ServerNbtReadError.into()),
  };

  for server_idx in 0..servers.len() {
    if let Ok(server) = servers.get::<&NbtCompound>(server_idx) {
      if let Ok(ip) = server.get::<_, &str>("ip") {
        let name = server.get::<_, &str>("name").unwrap_or("unknown");
        let icon;
        if let Ok(val) = server.get::<_, &str>("icon") {
          icon = val;
        } else {
          icon = "";
        }
        game_servers.push(GameServerInfo {
          icon_src: icon.to_string(),
          ip: ip.to_string(),
          name: name.to_string(),
          is_queried: false,
          players_online: 0,
          players_max: 0,
          online: false,
        });
      }
    }
  }

  // query_online is true, amend query and return player count and online status
  if query_online {
    for server in &mut game_servers {
      let url = format!("https://mc.sjtu.cn/custom/serverlist/?query={}", server.ip);
      server.is_queried = false;
      let response = match reqwest::get(&url).await {
        Ok(response) => response,
        Err(_) => continue, // request error
      };
      if !response.status().is_success() {
        continue; // request error
      }
      let data = match response.json::<Value>().await {
        Ok(data) => data,
        Err(_) => continue, // JSON parse error
      };
      // manually parse the JSON into the required fields
      if let Some(players) = data["players"].as_object() {
        server.players_online = players["online"].as_u64().unwrap_or(0) as usize;
        server.players_max = players["max"].as_u64().unwrap_or(0) as usize;
      }
      server.online = data["online"].as_bool().unwrap_or(false);
      server.icon_src = data["favicon"].as_str().unwrap_or("").to_string();
      server.is_queried = true;
    }
  }

  Ok(game_servers)
}

#[tauri::command]
pub async fn retrive_resource_pack_list(
  app: AppHandle,
  instance_id: usize,
) -> SJMCLResult<Vec<ResourcePackInfo>> {
  // Get the resource packs list based on the instance
  let resource_packs_dir =
    match get_instance_subdir_path(&app, instance_id, &InstanceSubdirType::ResourcePacks) {
      Some(path) => path,
      None => return Ok(Vec::new()),
    };
  get_resource_pack_info_from_zip(&resource_packs_dir)
}

#[tauri::command]
pub async fn retrive_server_resource_pack_list(
  app: AppHandle,
  instance_id: usize,
) -> SJMCLResult<Vec<ResourcePackInfo>> {
  let resource_packs_dir =
    match get_instance_subdir_path(&app, instance_id, &InstanceSubdirType::ServerResourcePacks) {
      Some(path) => path,
      None => return Ok(Vec::new()),
    };
  get_resource_pack_info_from_zip(&resource_packs_dir)
}

#[tauri::command]
pub fn retrive_schematic_list(
  app: AppHandle,
  instance_id: usize,
) -> SJMCLResult<Vec<SchematicInfo>> {
  let schematics_dir =
    match get_instance_subdir_path(&app, instance_id, &InstanceSubdirType::Schematics) {
      Some(path) => path,
      None => return Ok(Vec::new()),
    };

  if !schematics_dir.exists() {
    return Ok(Vec::new());
  }
  let valid_extensions = RegexBuilder::new(r"\.(litematic|schematic)$")
    .case_insensitive(true)
    .build()
    .unwrap();
  let mut schematic_list = Vec::new();
  for schematic_path in get_files_with_regex(schematics_dir.as_path(), &valid_extensions)? {
    schematic_list.push(SchematicInfo {
      name: schematic_path
        .file_stem()
        .unwrap()
        .to_string_lossy()
        .to_string(),
      file_path: schematic_path,
    });
  }

  Ok(schematic_list)
}

#[tauri::command]
pub fn retrive_shader_pack_list(
  app: AppHandle,
  instance_id: usize,
) -> SJMCLResult<Vec<ShaderPackInfo>> {
  // Get the shaderpacks directory based on the instance
  let shaderpacks_dir =
    match get_instance_subdir_path(&app, instance_id, &InstanceSubdirType::ShaderPacks) {
      Some(path) => path,
      None => return Ok(Vec::new()),
    };

  if !shaderpacks_dir.exists() {
    return Ok(Vec::new());
  }

  let valid_extensions = RegexBuilder::new(r"\.zip$")
    .case_insensitive(true)
    .build()
    .unwrap();
  let mut shaderpack_list = Vec::new();
  // TODO: async read files
  for path in get_files_with_regex(shaderpacks_dir, &valid_extensions)? {
    shaderpack_list.push(ShaderPackInfo {
      file_name: path.file_stem().unwrap().to_string_lossy().to_string(),
      file_path: path,
    });
  }

  Ok(shaderpack_list)
}

#[tauri::command]
pub fn retrive_screenshot_list(
  app: AppHandle,
  instance_id: usize,
) -> SJMCLResult<Vec<ScreenshotInfo>> {
  let screenshots_dir =
    match get_instance_subdir_path(&app, instance_id, &InstanceSubdirType::Screenshots) {
      Some(path) => path,
      None => return Ok(Vec::new()),
    };

  if !screenshots_dir.exists() {
    return Ok(Vec::new());
  }

  // The default screenshot format in Minecraft is PNG. For broader compatibility, JPG and JPEG formats are also included here.
  let valid_extensions = RegexBuilder::new(r"\.(jpg|jpeg|png)$")
    .case_insensitive(true)
    .build()
    .unwrap();
  let mut screenshot_list = Vec::new();
  for path in get_files_with_regex(screenshots_dir, &valid_extensions)? {
    let metadata = path.metadata().unwrap();
    let modified_time = metadata.modified().unwrap();
    let timestamp = modified_time
      .duration_since(SystemTime::UNIX_EPOCH)
      .unwrap()
      .as_secs();
    screenshot_list.push(ScreenshotInfo {
      file_name: path.file_stem().unwrap().to_string_lossy().to_string(),
      file_path: path,
      time: timestamp,
    });
  }

  Ok(screenshot_list)
}
