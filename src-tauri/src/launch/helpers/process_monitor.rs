use crate::error::SJMCLResult;
use crate::launch::constant::GAME_PROCESS_OUTPUT_CHANNEL;
use crate::launch::models::LaunchError;
use crate::launcher_config::models::ProcessPriority;
use crate::utils::window::create_webview_window;
use chrono;
use std::io::{BufRead, BufReader};
use std::process::{Child, Command};
use std::thread;
use tauri::{AppHandle, Emitter};

pub fn set_process_priority(pid: u32, priority: &ProcessPriority) -> SJMCLResult<()> {
  #[cfg(any(target_os = "macos", target_os = "linux"))]
  {
    let nice_value = match *priority {
      ProcessPriority::Low => 5,
      ProcessPriority::BelowNormal => 1,
      ProcessPriority::Normal => 0,
      // FIXME: above normal need permission
      ProcessPriority::AboveNormal => -1,
      ProcessPriority::High => -5,
    };

    let _ = Command::new("renice")
      .args([nice_value.to_string(), "-p".to_string(), pid.to_string()])
      .output();
  }

  #[cfg(target_os = "windows")]
  {
    use std::mem;
    use winapi::um::processthreadsapi::{CloseHandle, OpenProcess, SetPriorityClass};
    use winapi::um::winnt::{
      ABOVE_NORMAL_PRIORITY_CLASS, BELOW_NORMAL_PRIORITY_CLASS, DWORD, FALSE, HANDLE,
      HIGH_PRIORITY_CLASS, NORMAL_PRIORITY_CLASS, PROCESS_SET_INFORMATION,
    };

    unsafe {
      let h_process = OpenProcess(PROCESS_SET_INFORMATION, FALSE, pid as DWORD);
      if h_process.is_null() {
        return Err(std::io::Error::new(
          std::io::ErrorKind::Other,
          "Failed to open process on Windows",
        ));
      }

      let priority_class = match *priority {
        ProcessPriority::Low => BELOW_NORMAL_PRIORITY_CLASS,
        ProcessPriority::BelowNormal => BELOW_NORMAL_PRIORITY_CLASS,
        ProcessPriority::Normal => NORMAL_PRIORITY_CLASS,
        ProcessPriority::AboveNormal => ABOVE_NORMAL_PRIORITY_CLASS,
        ProcessPriority::High => HIGH_PRIORITY_CLASS,
      };

      if SetPriorityClass(h_process, priority_class) == 0 {
        CloseHandle(h_process);
        return Err(std::io::Error::new(
          std::io::ErrorKind::Other,
          "Failed to set priority class on Windows",
        ));
      }

      CloseHandle(h_process);
    }
  }

  Ok(())
}

pub fn kill_process(pid: u32) -> SJMCLResult<()> {
  #[cfg(any(target_os = "linux", target_os = "macos"))]
  {
    Command::new("kill")
      .args(["-9", &pid.to_string()])
      .output()
      .map_err(|_| LaunchError::KillProcessFailed)?;
  }

  #[cfg(target_os = "windows")]
  {
    use std::os::windows::process::CommandExt;

    Command::new("taskkill")
      .args(["/F", "/T", "/PID", &pid.to_string()])
      .creation_flags(0x08000000) // CREATE_NO_WINDOW
      .output()
      .map_err(|_| LaunchError::KillProcessFailed)?;
  }

  Ok(())
}

pub async fn monitor_process_output(
  app: AppHandle,
  child: &mut Child,
  display_log_window: bool,
) -> SJMCLResult<()> {
  // create unique log window
  let timestamp = chrono::Local::now().format("%Y%m%d%H%M%S").to_string();
  let label = format!("game_log_{}", timestamp);
  if display_log_window {
    let _ = create_webview_window(&app, &label, "game_log", None).await?;
  }

  let stdout = child.stdout.take();
  let stderr = child.stderr.take();

  if display_log_window {
    if let Some(out) = stdout {
      let app_clone = app.clone();
      let label_clone = label.clone();
      thread::spawn(move || {
        let reader = BufReader::new(out);
        for line in reader.lines().map_while(Result::ok) {
          let _ = app_clone.emit_to(&label_clone, GAME_PROCESS_OUTPUT_CHANNEL, line);
        }
      });
    }

    if let Some(err) = stderr {
      let app_clone = app.clone();
      let label_clone = label.clone();
      thread::spawn(move || {
        let reader = BufReader::new(err);
        for line in reader.lines().map_while(Result::ok) {
          let _ = app_clone.emit_to(&label_clone, GAME_PROCESS_OUTPUT_CHANNEL, line);
        }
      });
    }
  }

  // TODO: show error window (get stderr or process exit with error code?)

  // TODO: auto destroy log window when process exit normally?

  Ok(())
}
