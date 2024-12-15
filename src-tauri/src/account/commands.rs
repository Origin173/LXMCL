use super::helpers::{read_or_empty, save_accounts};
use super::models::{Account, Player};
use uuid::Uuid;

#[tauri::command]
pub fn add_account(player: Player) -> Result<(), ()> {
  let mut state = read_or_empty();

  let uuid = Uuid::new_v4();
  if player.server_type == "offline" {
    state.push(Account {
      name: player.name,
      uuid,
      avatar_url: "https://littleskin.cn/avatar/0?size=72&png=1".to_string(),
      server_type: player.server_type,
      auth_account: "".to_string(),
      password: "".to_string(),
    });
  } else {
    // todo: real login
    state.push(Account {
      name: "Player".to_string(),
      uuid,
      avatar_url: "https://littleskin.cn/avatar/0?size=72&png=1".to_string(),
      server_type: player.server_type,
      auth_account: player.name,
      password: player.password,
    });
  }

  save_accounts(state);

  Ok(())
}

#[tauri::command]
pub fn delete_account(uuid_str: &str) -> Result<(), String> {
  let mut state = read_or_empty();

  if let Ok(uuid) = Uuid::parse_str(uuid_str) {
    state.retain(|s| s.uuid != uuid);
    save_accounts(state);

    Ok(())
  } else {
    Err("UUID format is wrong.".to_string())
  }
}
