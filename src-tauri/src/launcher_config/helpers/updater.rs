use crate::error::SJMCLResult;
use crate::launcher_config::models::{LauncherConfig, LauncherConfigError};
use serde_json::Value;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use tauri_plugin_http::reqwest;

pub async fn fetch_latest_version(
  app: &AppHandle,
) -> SJMCLResult<Option<(String, String, String)>> {
  let config_binding = app.state::<Mutex<LauncherConfig>>();
  let (os, arch, is_portable) = {
    let config_state = config_binding.lock()?;
    (
      config_state.basic_info.os_type.clone(),
      config_state.basic_info.arch.clone(),
      config_state.basic_info.is_portable,
    )
  };
  let client = app.state::<reqwest::Client>();

  type SourceTuple = (&'static str, &'static str, fn(&str, &str) -> String);
  let sources: [SourceTuple; 2] = [
    (
      "https://mc.sjtu.cn/api-sjmcl/releases/latest",
      "version",
      |_, fname| format!("https://mc.sjtu.cn/sjmcl/releases/{}", fname),
    ),
    (
      "https://api.github.com/repos/UNIkeEN/SJMCL/releases/latest",
      "tag_name",
      |ver, fname| {
        format!(
          "https://github.com/UNIkeEN/SJMCL/releases/download/v{}/{}",
          ver, fname
        )
      },
    ),
  ];

  for (endpoint, field, mk_url) in sources {
    if let Ok(resp) = client.get(endpoint).send().await {
      if let Ok(j) = resp.json::<Value>().await {
        if let Some(mut ver) = j.get(field).and_then(|v| v.as_str()).map(|s| s.to_string()) {
          if ver.starts_with('v') {
            ver.remove(0);
          }
          let fname = build_filename(&ver, os.as_str(), arch.as_str(), is_portable);
          let url = mk_url(&ver, &fname);
          return Ok(Some((ver, url, fname)));
        }
      }
    }
  }

  Err(LauncherConfigError::FetchError.into())
}

fn build_filename(ver: &str, os: &str, arch: &str, is_portable: bool) -> String {
  let arch = if arch == "x86" { "i686" } else { arch };
  let suffix = match os {
    "windows" => {
      if is_portable {
        "_portable.exe"
      } else {
        ".msi"
      }
    }
    "linux" => ".AppImage",
    "macos" => ".app.tar.gz",
    _ => "",
  };
  format!("SJMCL_{}_{}_{}{}", ver, os, arch, suffix)
}
