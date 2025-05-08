use crate::error::SJMCLResult;
use crate::instance::constants::INSTANCE_CFG_FILE_NAME;
use crate::instance::models::misc::Instance;
use crate::launch::constant::*;
use crate::launch::models::LaunchError;
use crate::launcher_config::models::ProcessPriority;
use crate::storage::save_json_async;
use crate::utils::window::create_webview_window;
use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::process::{Child, Command};
use std::sync::{atomic, mpsc::Sender, Arc, Mutex};
use std::thread;
use std::time::{Instant, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager};
use tokio;

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
  instance_id: String,
  display_log_window: bool,
  ready_tx: Sender<()>,
) -> SJMCLResult<()> {
  // create unique log window
  let timestamp = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_secs();
  let label = format!("game_log_{}", timestamp);
  let log_window = if display_log_window {
    match create_webview_window(&app, &label, "game_log", None).await {
      Ok(window) => Some(window),
      Err(_) => None,
    }
  } else {
    None
  };

  let stdout = child.stdout.take();
  let stderr = child.stderr.take();
  let game_ready_flag = Arc::new(atomic::AtomicBool::new(false));
  let start_time: Arc<Mutex<Option<Instant>>> = Arc::new(Mutex::new(None)); // used to calculate play time

  // handle game process stdout
  if let Some(out) = stdout {
    let app_stdout = app.clone();
    let label_stdout = label.clone();
    let tx_clone_stdout = ready_tx.clone();
    let game_ready_flag = game_ready_flag.clone();
    let start_time = start_time.clone();

    thread::spawn(move || {
      let reader = BufReader::new(out);
      for line in reader.lines().map_while(Result::ok) {
        if display_log_window {
          let _ = app_stdout.emit_to(&label_stdout, GAME_PROCESS_OUTPUT_CHANNEL, &line);
        }

        // the first time when log contains 'Render thread', send signal to launch command, close frontend modal.
        // TODO: find a better way.
        if !game_ready_flag.load(atomic::Ordering::SeqCst) && line.contains(GAME_WINDOW_READY_FLAG)
        {
          game_ready_flag.store(true, atomic::Ordering::SeqCst);

          // record Instant::now as game start time
          let mut start_time_lock = start_time.lock().unwrap();
          if start_time_lock.is_none() {
            *start_time_lock = Some(Instant::now());
          }

          let _ = tx_clone_stdout.send(());
        }
      }
    });
  }

  // handle game process stderr
  if let Some(err) = stderr {
    let app_stderr = app.clone();
    let label_stderr = label.clone();
    let tx_clone_stderr = ready_tx.clone();
    let game_ready_flag = game_ready_flag.clone();
    let start_time = start_time.clone();

    thread::spawn(move || {
      let reader = BufReader::new(err);
      for line in reader.lines().map_while(Result::ok) {
        if display_log_window {
          let _ = app_stderr.emit_to(&label_stderr, GAME_PROCESS_OUTPUT_CHANNEL, &line);
        }

        if !game_ready_flag.load(atomic::Ordering::SeqCst) && line.contains(GAME_WINDOW_READY_FLAG)
        {
          game_ready_flag.store(true, atomic::Ordering::SeqCst);

          let mut start_time_lock = start_time.lock().unwrap();
          if start_time_lock.is_none() {
            *start_time_lock = Some(Instant::now());
          }

          let _ = tx_clone_stderr.send(());
        }
      }
    });
  }

  // handle game process exit
  let instance_id_clone = instance_id.clone();
  let mut dummy_child = Command::new("true").spawn()?;
  let _ = dummy_child.wait();
  let mut child = std::mem::replace(child, dummy_child);
  let game_ready_flag = game_ready_flag.clone();
  tokio::spawn(async move {
    if let Ok(status) = child.wait() {
      if !game_ready_flag.load(atomic::Ordering::SeqCst) {
        let _ = ready_tx.send(());
      }

      if status.success() {
        println!("Game process exited successfully.");
        if let Some(window) = log_window {
          // auto close the game-log window if the game exits successfully
          let _ = window.destroy();
        }
      } else {
        println!("Game process exited with an error status: {:?}", status);
      }

      let start_time_lock = start_time.lock().unwrap();
      if let Some(start_time) = *start_time_lock {
        let elapsed_time = start_time.elapsed().as_secs() as u128;

        // Lock instances state and update play_time
        let binding = app.state::<Mutex<HashMap<String, Instance>>>();
        let mut state = binding.lock().unwrap();
        if let Some(instance) = state.get_mut(&instance_id_clone) {
          instance.play_time += elapsed_time;
          let instance_clone = instance.clone();
          let version_path = instance.version_path.clone();
          tokio::task::spawn(async move {
            let _ = save_json_async::<Instance>(
              &instance_clone,
              &version_path.join(INSTANCE_CFG_FILE_NAME),
            )
            .await;
          });
        }
      }
    }
  });

  // TODO: show error window (get stderr or process exit with error code?)

  Ok(())
}
