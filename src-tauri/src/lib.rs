// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::path::Path;
use std::process::Command;

#[tauri::command]
fn fix_video(input: &str, output: &str) -> String {
    let input_path = Path::new(input).to_str().unwrap();
    let output_path = Path::new(output).to_str().unwrap();
    let result = Command::new("ffmpeg")
        .args(["-y", "-i", input_path, "-c", "copy", output_path])
        .output().unwrap();
    let exit_code = result.status.code().unwrap();
    if exit_code != 0 {
        let msg = String::from_utf8_lossy(&result.stderr).to_string();
        println!("failure: convert {} to {}, err: {}", input, output, msg);
    } else {
        println!("success: convert {} to {}", input, output);
    }
    if exit_code != 0 {
        return "failure".to_string();
    }
    "success".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![fix_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
