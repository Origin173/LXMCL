use super::models::Player;
use crate::{
  error::{SJMCLError, SJMCLResult},
  storage::Storage,
};
use uuid::Uuid;

#[tauri::command]
pub fn add_account(player: Player) -> SJMCLResult<()> {
  let uuid = Uuid::new_v4();
  match player.server_type.as_str() {
    "offline" => {
      let mut state: Vec<Player> = Storage::load().unwrap_or_default();

      state.push(Player {
        name: player.name,
        uuid,
        avatar_url: "https://littleskin.cn/avatar/0?size=72&png=1".to_string(),
        server_type: player.server_type,
        auth_account: "".to_string(),
        password: "".to_string(),
      });

      state.save()?;
      Ok(())
    }
    "3rdparty" => {
      let mut state: Vec<Player> = Storage::load().unwrap_or_default();

      // todo: real login
      state.push(Player {
        name: "Player".to_string(),
        uuid,
        avatar_url: "https://littleskin.cn/avatar/0?size=72&png=1".to_string(),
        server_type: player.server_type,
        auth_account: player.auth_account,
        password: player.password,
      });

      state.save()?;
      Ok(())
    }
    _ => Err(SJMCLError("Unknown server type".to_string())),
  }
}

#[tauri::command]
pub fn delete_account(uuid_str: &str) -> SJMCLResult<()> {
  let mut state: Vec<Player> = Storage::load().unwrap_or_default();

  let uuid = Uuid::parse_str(uuid_str)?;
  state.retain(|s| s.uuid != uuid);
  state.save()?;
  Ok(())
}
