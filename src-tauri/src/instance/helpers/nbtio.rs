use crate::error::{SJMCLError, SJMCLResult};
use quartz_nbt::{io::read_nbt, io::Flavor, NbtCompound, NbtList};
use std::fs::File;
use std::io::{Cursor, Read};
use std::path::PathBuf;

pub fn load_nbt(nbt_path: &PathBuf, compress_method: Flavor) -> SJMCLResult<NbtCompound> {
  match File::open(nbt_path) {
    Ok(mut nbt_file) => {
      let mut nbt_bytes = Vec::new();
      if let Err(e) = nbt_file.read_to_end(&mut nbt_bytes) {
        return Err(SJMCLError::from(e));
      }
      match read_nbt(&mut Cursor::new(nbt_bytes), compress_method) {
        Ok(nbt) => Ok(nbt.0),
        Err(e) => Err(SJMCLError::from(e)),
      }
    }
    Err(e) => Err(SJMCLError::from(e)),
  }
}

pub fn nbt_to_world_info(nbt: &NbtCompound) -> SJMCLResult<(i64, String, String)> {
  // return (last_played, difficulty, gamemode)
  match nbt.get::<_, &NbtCompound>("Data") {
    Ok(data) => {
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
        return Err(SJMCLError(format!(
          "difficulty = {}, which is greater than 5",
          difficulty
        )));
      }
      let gametype: i32;
      if let Ok(val) = data.get::<_, &i32>("GameType") {
        gametype = *val;
      } else {
        gametype = 0;
      }
      const GAMEMODE_STR: [&str; 4] = ["survival", "creative", "adventure", "spectator"];
      if gametype < 0 || gametype >= GAMEMODE_STR.len() as i32 {
        return Err(SJMCLError(format!(
          "gametype = {}, which < 0 or >= 4",
          gametype
        )));
      }
      Ok((
        last_played,
        DIFFICULTY_STR[difficulty as usize].to_string(),
        GAMEMODE_STR[gametype as usize].to_string(),
      ))
    }
    Err(e) => Err(SJMCLError::from(e)),
  }
}

pub fn nbt_to_servers_info(nbt: &NbtCompound) -> SJMCLResult<Vec<(String, String, String)>> {
  // return vec of (ip, name, icon_src)
  match nbt.get::<_, &NbtList>("servers") {
    Ok(servers) => {
      let mut servers_list = Vec::new();
      for server_idx in 0..servers.len() {
        if let Ok(server) = servers.get::<&NbtCompound>(server_idx) {
          match server.get::<_, &str>("ip") {
            Ok(ip) => {
              let icon = server.get::<_, &str>("icon").unwrap_or("");
              let name = server.get::<_, &str>("name").unwrap_or("unknown");
              servers_list.push((ip.to_string(), name.to_string(), icon.to_string()));
            }
            Err(_) => {
              continue;
            }
          }
        }
      }
      Ok(servers_list)
    }
    Err(e) => Err(SJMCLError::from(e)),
  }
}
