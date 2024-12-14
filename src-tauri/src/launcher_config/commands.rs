use super::helpers::save_config;
use super::models::{LauncherConfig, MemoryInfo};
use crate::partial::{PartialError, PartialUpdate};
use std::sync::Mutex;
use systemstat::{saturating_sub_bytes, Platform};
use tauri::State;

#[tauri::command]
pub fn get_launcher_config(state: State<'_, Mutex<LauncherConfig>>) -> LauncherConfig {
  state.lock().unwrap().clone()
}

#[tauri::command]
pub fn update_launcher_config(
  key_path: String,
  value: String,
  state: State<'_, Mutex<LauncherConfig>>,
) -> Result<(), PartialError> {
  let mut snake = String::new();
  for (i, ch) in key_path.char_indices() {
    if i > 0 && ch.is_uppercase() {
      snake.push('_');
    }
    snake.push(ch.to_ascii_lowercase());
  }
  let mut state = state.lock().unwrap();
  state.update(&snake, &value)?;
  save_config(&state);
  Ok(())
}

#[tauri::command]
pub fn restore_launcher_config(state: State<'_, Mutex<LauncherConfig>>) -> LauncherConfig {
  let mut state = state.lock().unwrap();
  *state = LauncherConfig::default();
  save_config(&state);
  state.clone()
}

#[tauri::command]
pub fn get_memory_info() -> Result<MemoryInfo, String> {
  let sys = systemstat::System::new();
  match sys.memory() {
    Ok(mem) => Ok(MemoryInfo {
      total: mem.total.as_u64(),
      used: saturating_sub_bytes(mem.total, mem.free).as_u64(),
    }),
    Err(e) => Err(e.to_string()),
  }
}
