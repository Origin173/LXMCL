use crate::launcher_config::models::LauncherConfig;
use crate::resource::helpers::{
  misc::get_source_priority_list, version_manifest::get_game_version_manifest,
};
use std::{cmp::Ordering, fs, sync::Mutex};
use tauri::{path::BaseDirectory, AppHandle, Manager};

/// Compare two Minecraft version IDs.
/// The order is determined by `assets/game/versions.txt`,
/// or fallback to cache, or fetch remote if necessary.
///
/// # Examples
/// ```
/// if compare_game_versions(&app, version, "1.19").await.le(&Ordering::Equal) {
///     println!("{} <= 1.19", version);
/// }
/// ```
///
/// # Expected result
/// - Returns `Ordering::Less` if `version_a` < `version_b`
/// - Returns `Ordering::Equal` if `version_a` == `version_b`
/// - Returns `Ordering::Greater` if `version_a` > `version_b`, or if `version_a` not found
/// - If both versions are not found, returns `Ordering::Equal`
///
pub async fn compare_game_versions(app: &AppHandle, version_a: &str, version_b: &str) -> Ordering {
  let try_find = |versions: &[String]| -> (Option<usize>, Option<usize>) {
    (
      versions.iter().position(|v| v == version_a),
      versions.iter().position(|v| v == version_b),
    )
  };

  let load_versions = |path: &str, dir| -> Vec<String> {
    app
      .path()
      .resolve(path, dir)
      .ok()
      .and_then(|path| fs::read_to_string(path).ok())
      .map(|content| content.lines().map(|l| l.trim().to_string()).collect())
      .unwrap_or_else(std::vec::Vec::new)
  };

  // Try to search version ids in built-in version list.
  let mut versions = load_versions("assets/game/versions.txt", BaseDirectory::Resource);
  let (mut idx_a, mut idx_b) = try_find(&versions);

  // Fallback to search in cache version list saved by `get_game_version_manifest()`.
  if idx_a.is_none() || idx_b.is_none() {
    versions = load_versions("game_versions.txt", BaseDirectory::AppCache);
    (idx_a, idx_b) = try_find(&versions);
  }

  // Fallback to fetch remote manifest and retry.
  if idx_a.is_none() || idx_b.is_none() {
    if let Some(state) = app.try_state::<Mutex<LauncherConfig>>() {
      let priority_list = {
        let locked = state.lock().unwrap(); // unwrap: 应用内State，不会panic
        get_source_priority_list(&locked)
      };
      let _ = get_game_version_manifest(app, &priority_list).await;
      versions = load_versions("game_versions.txt", BaseDirectory::AppCache);
      (idx_a, idx_b) = try_find(&versions);
    }
  }

  // compare version ids
  match (idx_a, idx_b) {
    (Some(a), Some(b)) => a.cmp(&b),
    (Some(_), None) => Ordering::Less,
    (None, Some(_)) => Ordering::Greater,
    (None, None) => Ordering::Equal,
  }
}
