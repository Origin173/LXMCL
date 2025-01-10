use super::models::Player;
use crate::{
  error::{SJMCLError, SJMCLResult},
  storage::Storage,
};
use uuid::Uuid;

#[tauri::command]
pub fn get_accounts() -> SJMCLResult<Vec<Player>> {
  let state: Vec<Player> = Storage::load().unwrap_or_default();
  Ok(state)
}

#[tauri::command]
pub fn add_account(player: Player) -> SJMCLResult<()> {
  let uuid = Uuid::new_v4();
  match player.server_type.as_str() {
    "offline" => {
      let mut state: Vec<Player> = Storage::load().unwrap_or_default();

      let mut new_player = player.clone();
      new_player.uuid = uuid.to_string();
      new_player.avatar_url = "https://littleskin.cn/avatar/0?size=72&png=1".to_string();

      state.push(new_player);
      state.save()?;
      Ok(())
    }
    "3rdparty" => {
      let mut state: Vec<Player> = Storage::load().unwrap_or_default();

      // todo: real login
      let mut new_player = player.clone();
      new_player.name = "Player".to_string();
      new_player.uuid = uuid.to_string();
      new_player.avatar_url = "https://littleskin.cn/avatar/0?size=72&png=1".to_string();

      state.push(new_player);
      state.save()?;
      Ok(())
    }
    _ => Err(SJMCLError("Unknown server type".to_string())),
  }
}

#[tauri::command]
pub fn delete_account(uuid: String) -> SJMCLResult<()> {
  let mut state: Vec<Player> = Storage::load().unwrap_or_default();

  state.retain(|s| s.uuid != uuid);
  state.save()?;
  Ok(())
}
