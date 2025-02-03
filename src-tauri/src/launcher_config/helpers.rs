use crate::{storage::Storage, EXE_DIR};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

use super::models::LauncherConfig;

impl Storage for LauncherConfig {
  fn file_path() -> PathBuf {
    EXE_DIR.join("sjmcl.conf.json")
  }
}

pub fn get_java_paths() -> Vec<String> {
  let mut paths = HashSet::new();

  // List java paths from System PATH variable
  #[cfg(target_os = "windows")]
  let command_output = Command::new("where").arg("java").output();

  #[cfg(any(target_os = "macos", target_os = "linux"))]
  let command_output = Command::new("which").args(&["-a", "java"]).output();

  if let Ok(output) = command_output {
    if output.status.success() {
      let stdout = String::from_utf8_lossy(&output.stdout);
      for line in stdout.lines() {
        if !line.trim().is_empty() {
          let path = line.trim().to_string();

          // solve symbol link to get real path
          let resolved_path = fs::canonicalize(&path)
            .map(|p| p.to_string_lossy().into_owned())
            .unwrap_or(path);

          paths.insert(resolved_path);
        }
      }
    }
  }

  // For macOS, run "/usr/libexec/java_home -V" additionally
  #[cfg(target_os = "macos")]
  {
    if let Ok(output) = Command::new("/usr/libexec/java_home").arg("-V").output() {
      if output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        for line in stderr.lines() {
          let trimmed = line.trim();
          // Don't use `split_whitespace().last()` because the path may contain spaces.
          if let Some(idx) = trimmed.rfind('"') {
            let path_part = &trimmed[idx + 1..].trim();
            if !path_part.is_empty() {
              let java_bin = PathBuf::from(path_part).join("bin/java");
              if java_bin.exists() {
                paths.insert(java_bin.to_string_lossy().to_string());
              }
            }
          }
        }
      }
    }
  }

  paths.into_iter().collect()
}

pub fn get_java_info_from_release_file(java_path: &str) -> Option<(String, String)> {
  // Typically, executable files are located in .../Home/bin/java, release file and bin folder are at the same level.
  let java_path_buf = PathBuf::from(java_path);
  let java_home = java_path_buf.parent()?.parent()?;
  let release_file = java_home.join("release");

  if !release_file.exists() {
    return None;
  }

  let content = fs::read_to_string(release_file).ok()?;
  let mut vendor = "Oracle Corporation".to_string();
  let mut full_version = "0".to_string();

  // Try to parse info from release file
  for line in content.lines() {
    if line.starts_with("JAVA_VERSION=") {
      let quoted = line.split('=').nth(1)?.trim().trim_matches('"');
      full_version = quoted.to_string();
    } else if line.starts_with("IMPLEMENTOR=") {
      let quoted = line.split('=').nth(1)?.trim().trim_matches('"');
      vendor = quoted.to_string();
    }
  }

  if full_version == "0" {
    None
  } else {
    Some((vendor, full_version))
  }
}

pub fn get_java_info_from_command(java_path: &str) -> Option<(String, String)> {
  // use "java -version" command to get info
  let output = Command::new(java_path).arg("-version").output().ok()?;

  if !output.status.success() {
    return None;
  }

  let stderr_bytes = output.stderr;
  let stderr_str = String::from_utf8_lossy(&stderr_bytes);
  let lines: Vec<&str> = stderr_str.lines().collect();

  let mut vendor = "Unknown".to_string();
  let mut full_version = "0".to_string();

  if let Some(first_line) = lines.get(0) {
    if first_line.contains("version") {
      if let Some(v) = first_line.split_whitespace().nth(2) {
        let cleaned = v.trim_matches('"');
        full_version = cleaned.to_string();
      }
    }
    // TODO: parse vendor from version command output
  }

  Some((vendor, full_version))
}

pub fn parse_java_major_version(full_version: &str) -> (i32, bool) {
  let major_version = if full_version.starts_with("1.") {
    // Java 1.x (e.g., 1.8 -> 8, 1.7 -> 7)
    full_version
      .split('.')
      .nth(1)
      .unwrap_or("0")
      .parse::<i32>()
      .unwrap_or(0)
  } else {
    // Java 9+
    full_version
      .split('.')
      .next()
      .unwrap_or("0")
      .parse::<i32>()
      .unwrap_or(0)
  };

  let is_lts = [8, 11, 17, 21, 25].contains(&major_version);
  (major_version, is_lts)
}
