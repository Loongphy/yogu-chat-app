mod auth;
mod database;
mod updater;
mod window;

use tauri::Listener;
use tauri_plugin_updater::UpdaterExt;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate cocoa;

// Only import the plugin for macOS
#[cfg(target_os = "macos")]
mod tauri_traffic_light_positioner_plugin;

#[tauri::command]
async fn web_auth() -> Result<auth::AuthInfo, String> {
    let _ = auth::auth().await;
    Ok(auth::AuthInfo {
        user_id: "123".to_string(),
        access_token: "456".to_string(),
    })
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;

        // alternatively we could also call update.download() and update.install() separately
        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        println!("update installed");
        app.restart();
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = create_app_builder();
    let builder = window::configure_builder(builder);

    builder
        .setup(|app| {
            window::create_main_window(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn create_app_builder() -> tauri::Builder<tauri::Wry> {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                updater::update(handle).await.unwrap();
            });
            Ok(())
        })
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            app.listen("deep-link://new-url", move |event| {
                dbg!(event);
            });
            Ok(())
        })
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:database.db", database::get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![web_auth])
}
