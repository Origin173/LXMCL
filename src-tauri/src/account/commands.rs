use super::helpers::{read_or_empty, save_accounts};
use super::models::Player;
use uuid::Uuid;

#[tauri::command]
pub fn add_account(player: Player) -> Result<(), String> {
  let uuid = Uuid::new_v4();
  match player.server_type.as_str() {
    "offline" => {
      let mut state = read_or_empty();

      state.push(Player {
        name: player.name,
        uuid,
        avatar_url: "https://littleskin.cn/avatar/0?size=72&png=1".to_string(),
        server_type: player.server_type,
        auth_account: "".to_string(),
        password: "".to_string(),
      });

      save_accounts(state);

      Ok(())
    }
    "3rdparty" => {
      let mut state = read_or_empty();

      // todo: real login
      state.push(Player {
        name: "Player".to_string(),
        uuid,
        avatar_url: "https://littleskin.cn/avatar/0?size=72&png=1".to_string(),
        server_type: player.server_type,
        auth_account: player.auth_account,
        password: player.password,
      });

      save_accounts(state);

      Ok(())
    }
    _ => Err("Unknown server type".to_string()),
  }
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
