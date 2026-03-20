use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub menu_shortcut: String,      // 菜单打开/关闭快捷键，默认 "P"
    pub console_key: String,        // 控制台按键，默认 "`"
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            menu_shortcut: "P".to_string(),
            console_key: "`".to_string(),
        }
    }
}

impl AppSettings {
    pub fn get_config_path() -> PathBuf {
        let app_data = std::env::var("APPDATA").unwrap_or_else(|_| ".".to_string());
        let mut path = PathBuf::from(app_data);
        path.push("com.yuinijika.csgo.consolemenu");
        path.push("config.json");
        path
    }

    pub fn load() -> Self {
        let path = Self::get_config_path();
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(settings) = serde_json::from_str(&content) {
                    return settings;
                }
            }
        }
        Self::default()
    }

    pub fn save(&self) -> Result<String, String> {
        let path = Self::get_config_path();
        
        // 确保目录存在
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| format!("创建目录失败：{:?}", e))?;
        }
        
        let content = serde_json::to_string_pretty(self)
            .map_err(|e| format!("序列化失败：{:?}", e))?;
        
        fs::write(&path, content)
            .map_err(|e| format!("写入文件失败：{:?}", e))?;
        
        Ok("设置已保存".to_string())
    }
}
