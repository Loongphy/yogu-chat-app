use tauri::{App, Builder, Error, Wry};

#[cfg(target_os = "macos")]
use crate::tauri_traffic_light_positioner_plugin;

pub fn configure_builder(builder: Builder<Wry>) -> Builder<Wry> {
    #[cfg(target_os = "macos")]
    {
        builder.plugin(tauri_traffic_light_positioner_plugin::init())
    }
    #[cfg(not(target_os = "macos"))]
    {
        builder
    }
}

pub fn create_main_window(app: &App) -> Result<(), Error> {
    let window =
        tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::App("index.html".into()))
            .min_inner_size(1024.0, 768.0)
            .resizable(true)
            .fullscreen(false);

    #[cfg(target_os = "macos")]
    {
        use tauri::TitleBarStyle;
        let window = window
            .title_bar_style(TitleBarStyle::Overlay)
            .hidden_title(true);
        window.build()?;
    }

    #[cfg(not(target_os = "macos"))]
    {
        // let window = window.decorations(false);
        window.build()?;
    }

    Ok(())
}
