// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::process::Command;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![fix_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn fix_video(input: &str, output: &str) -> String {
    let result = Command::new("ffmpeg")
        .arg(format!("-i '{}' -c copy '{}'", input, output))
        .output();
    let msg = match result {
        Ok(output) => {
            if output.stdout.len() > 0 {
                return String::from_utf8_lossy(&output.stdout).to_string();
            }
            return String::from_utf8_lossy(&output.stderr).to_string();
        },
        Err(err) => err.to_string(),
    };
    println!("convert {} to {}, msg: {}", input, output, msg);
    msg.to_string()
}