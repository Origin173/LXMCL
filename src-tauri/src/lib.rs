use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::menu::MenuBuilder;
use tauri::Manager;

mod launcher_config;

pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      launcher_config::get_launcher_config,
      launcher_config::update_launcher_config
    ])
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      // Set the launcher config
      let mut launcher_config = launcher_config::read_or_default();
      launcher_config.version = app.package_info().version.to_string();
      launcher_config::save_config(&launcher_config);
      app.manage(Mutex::new(launcher_config));

      let menu = MenuBuilder::new(app).build()?;
      app.set_menu(menu)?;

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
