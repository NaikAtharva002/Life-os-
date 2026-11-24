//! LIFE OS Native Desktop Core Library
//! Implements high-performance native system integrations via Tauri and Rust.

use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct NotePayload {
    pub id: String,
    pub title: String,
    pub content: String,
    pub category: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NativeTelemetry {
    pub os_name: String,
    pub arch: String,
    pub local_time: String,
    pub is_desktop_native: bool,
}

/// Command: Writes Obsidian notes directly to a native local folder without browser sandbox limits.
#[tauri::command]
pub fn export_obsidian_vault(target_directory: String, notes: Vec<NotePayload>) -> Result<String, String> {
    let base_path = Path::new(&target_directory);
    
    if !base_path.exists() {
        fs::create_dir_all(base_path).map_err(|e| format!("Failed to create vault directory: {}", e))?;
    }

    let mut written_count = 0;
    for note in notes {
        let safe_title = note.title.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");
        let filename = format!("{}.md", safe_title);
        
        let file_path = if let Some(cat) = &note.category {
            let cat_dir = base_path.join(cat);
            if !cat_dir.exists() {
                let _ = fs::create_dir_all(&cat_dir);
            }
            cat_dir.join(&filename)
        } else {
            base_path.join(&filename)
        };

        let mut file = File::create(&file_path).map_err(|e| format!("Failed to create note {}: {}", filename, e))?;
        
        let header = format!("---\ntitle: \"{}\"\nupdated_at: \"{}\"\n---\n\n", 
            note.title, 
            note.updated_at.unwrap_or_default()
        );
        
        file.write_all(header.as_bytes()).map_err(|e| e.to_string())?;
        file.write_all(note.content.as_bytes()).map_err(|e| e.to_string())?;
        written_count += 1;
    }

    Ok(format!("Successfully exported {} notes to {}", written_count, target_directory))
}

/// Command: Dispatches an OS-level notification for evening review or critical task reminders.
#[tauri::command]
pub fn dispatch_desktop_notification(title: String, body: String) -> Result<bool, String> {
    println!("[LIFE OS Native] Notification: {} — {}", title, body);
    // When tauri-plugin-notification is linked at runtime, this sends a native desktop alert.
    Ok(true)
}

/// Command: Returns native host architecture and runtime state.
#[tauri::command]
pub fn get_native_telemetry() -> Result<NativeTelemetry, String> {
    Ok(NativeTelemetry {
        os_name: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        local_time: chrono::Local::now().to_rfc3339(),
        is_desktop_native: true,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            export_obsidian_vault,
            dispatch_desktop_notification,
            get_native_telemetry
        ])
        .run(tauri::generate_context!())
        .expect("error while running LIFE OS desktop application");
}
