use serde::{Deserialize, Serialize};
use std::sync::LazyLock;
use std::{path::PathBuf, sync::Mutex};
use tauri::State;

#[tauri::command]
pub fn get_launcher_config(state: State<'_, Mutex<LauncherConfig>>) -> LauncherConfig {
  state.lock().unwrap().clone()
}

#[tauri::command]
pub fn update_launcher_config(
  launcher_config: LauncherConfig,
  state: State<'_, Mutex<LauncherConfig>>,
) {
  let mut state = state.lock().unwrap();
  *state = launcher_config;
  save_config(&state);
}

static CONFIG_PATH: LazyLock<PathBuf> = LazyLock::new(|| {
  std::env::current_exe()
    .unwrap()
    .parent()
    .unwrap()
    .join("launcher_config.json")
});

pub fn read_or_default() -> LauncherConfig {
  if let Ok(config) = std::fs::read_to_string(CONFIG_PATH.as_path()) {
    serde_json::from_str(&config).unwrap_or_default()
  } else {
    LauncherConfig::default()
  }
}

pub fn save_config(config: &LauncherConfig) {
  let config = serde_json::to_string_pretty(config).unwrap();
  std::fs::write(CONFIG_PATH.as_path(), config).unwrap();
}

structstruck::strike! {
  #[strikethrough[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize)]]
  #[strikethrough[serde(rename_all = "camelCase", deny_unknown_fields)]]
  pub struct LauncherConfig {
    pub version: String,
    pub mocked: bool,
    pub appearance: struct {
      pub theme: struct {
        pub primary_color: String,
      },
      pub background: struct {
        pub preset_choice: String,
      }
    },
    pub download: struct DownloadConfig {
      pub source: struct {
        pub strategy: String,
      },
      pub download: struct {
        pub auto_concurrent: bool,
        pub concurrent_count: usize,
        pub enable_speed_limit: bool,
        pub speed_limit_value: usize,
      },
      pub cache: struct {
        pub directory: String,
      }
    },
    pub general: struct GeneralConfig {
      pub general: struct {
        pub language: String,
      }
    }
  }
}

impl Default for LauncherConfig {
  fn default() -> Self {
    Self {
      version: "dev".to_string(),
      mocked: false,
      appearance: Appearance {
        theme: Theme {
          primary_color: "blue".to_string(),
        },
        background: Background {
          preset_choice: "Jokull".to_string(),
        },
      },
      download: DownloadConfig {
        source: Source {
          strategy: "auto".to_string(),
        },
        download: Download {
          auto_concurrent: true,
          concurrent_count: 64,
          enable_speed_limit: false,
          speed_limit_value: 1024,
        },
        cache: Cache {
          directory: "/mock/path/to/cache/".to_string(),
        },
      },
      general: GeneralConfig {
        general: General {
          language: "zh-Hans".to_string(),
        },
      },
    }
  }
}
