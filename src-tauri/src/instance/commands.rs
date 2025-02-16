use super::models::GameServerInfo;
use crate::error::SJMCLResult;
use serde_json::Value;
use tauri_plugin_http::reqwest;

#[tauri::command]
pub async fn retrive_game_server_list(
  instance_id: usize,
  query_online: bool,
) -> SJMCLResult<Vec<GameServerInfo>> {
  // query_online is false, return local data from nbt (servers.dat)
  // TODO: now use mock data
  let mut game_servers = vec![
    GameServerInfo {
        icon_src: "https://mc.sjtu.cn/wiki/images/8/8c/SMP2-server-icon.png".to_string(),
        ip: "smp2.sjmc.club".to_string(),
        name: "SJMC-SMP2.6".to_string(),
        is_queried: false,
        players_online: 0,
        players_max: 0,
        online: false,
    },
    GameServerInfo {
        icon_src: "https://zh.minecraft.wiki/images/thumb/Minecraft_Preview_icon_2.png/240px-Minecraft_Preview_icon_2.png".to_string(),
        ip: "smp3.sjmc.club".to_string(),
        name: "SJMC-SMP3(offline display test)".to_string(),
        is_queried: false,
        players_online: 0,
        players_max: 0,
        online: false,
    },
  ];

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
