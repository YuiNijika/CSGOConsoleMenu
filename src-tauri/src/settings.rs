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
        // 使用系统文档目录
        let config_dir = dirs::document_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("CSGOConsoleMenu");
        config_dir.join("config.json")
    }

    pub fn load() -> Self {
        let path = Self::get_config_path();
        println!("尝试从 {:?} 加载配置", path);
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                println!("配置文件内容：{}", content);
                if let Ok(settings) = serde_json::from_str(&content) {
                    println!("配置加载成功：{:?}", settings);
                    return settings;
                } else {
                    println!("配置文件解析失败");
                }
            } else {
                println!("配置文件读取失败");
            }
        } else {
            println!("配置文件不存在");
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
        
        Ok("设置已保存到".to_string())
    }
}
