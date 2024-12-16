use super::models::{LauncherConfig, MemoryInfo};
use crate::storage::Storage;
use crate::{error::SJMCLResult, partial::PartialUpdate};
use std::sync::Mutex;
use systemstat::{saturating_sub_bytes, Platform};
use tauri::State;

#[tauri::command]
pub fn get_launcher_config(state: State<'_, Mutex<LauncherConfig>>) -> SJMCLResult<LauncherConfig> {
  let state = state.lock()?;
  Ok(state.clone())
}

#[tauri::command]
pub fn update_launcher_config(
  key_path: String,
  value: String,
  state: State<'_, Mutex<LauncherConfig>>,
) -> SJMCLResult<()> {
  let mut snake = String::new();
  for (i, ch) in key_path.char_indices() {
    if i > 0 && ch.is_uppercase() {
      snake.push('_');
    }
    snake.push(ch.to_ascii_lowercase());
  }
  let mut state = state.lock()?;
  state.update(&snake, &value)?;
  state.save()?;
  Ok(())
}

#[tauri::command]
pub fn restore_launcher_config(
  state: State<'_, Mutex<LauncherConfig>>,
) -> SJMCLResult<LauncherConfig> {
  let mut state = state.lock()?;
  *state = LauncherConfig::default();
  state.save()?;
  Ok(state.clone())
}

#[tauri::command]
pub fn get_memory_info() -> SJMCLResult<MemoryInfo> {
  let sys = systemstat::System::new();
  let mem = sys.memory()?;
  Ok(MemoryInfo {
    total: mem.total.as_u64(),
    used: saturating_sub_bytes(mem.total, mem.free).as_u64(),
  })
}
