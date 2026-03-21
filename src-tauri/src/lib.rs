mod settings;

use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use tauri::{Manager, State};
use windows::Win32::UI::WindowsAndMessaging::{SetForegroundWindow, ShowWindow, SW_RESTORE};
use windows::Win32::Foundation::{HWND, LPARAM, BOOL};
use enigo::{Enigo, Settings, Keyboard, Direction};
use std::sync::Mutex;
use settings::AppSettings;

// 共享状态结构
pub struct AppState {
    pub cheats_enabled: Mutex<bool>,
    pub cached_hwnd: AtomicU64,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            cheats_enabled: Mutex::new(false),
            cached_hwnd: AtomicU64::new(0),
        }
    }
}

static MENU_VISIBLE: AtomicBool = AtomicBool::new(false);
static SHORTCUT_KEY: AtomicU64 = AtomicU64::new(0x50); // 默认 P

#[tauri::command]
fn toggle_menu(window: tauri::WebviewWindow) -> bool {
    // 先设置前景窗口，防止按键传递到系统
    if let Ok(hwnd_ptr) = window.hwnd() {
        unsafe {
            let _ = SetForegroundWindow(HWND(hwnd_ptr.0));
        }
    }
    
    let current = MENU_VISIBLE.load(Ordering::SeqCst);
    let new_state = !current;
    MENU_VISIBLE.store(new_state, Ordering::SeqCst);
    
    if new_state {
        let _ = window.show();
        let _ = window.set_focus();
    } else {
        let _ = window.hide();
    }
    
    new_state
}

#[tauri::command]
fn send_console_command(command: String, console_key: String, state: State<AppState>) -> Result<bool, String> {
    let hwnd_val = state.cached_hwnd.load(Ordering::Relaxed);
    let csgo_window = if hwnd_val != 0 {
        HWND(hwnd_val as *mut _)
    } else {
        let hwnd = find_csgo_window()?;
        state.cached_hwnd.store(hwnd.0 as u64, Ordering::Relaxed);
        hwnd
    };
    
    unsafe {
        let _ = ShowWindow(csgo_window, SW_RESTORE);
        let _ = SetForegroundWindow(csgo_window);
    }
    
    std::thread::sleep(std::time::Duration::from_millis(100));
    
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| format!("初始化失败 {:?}", e))?;
    
    // 开启控制台使用自定义按键
    let open_console_char = console_key.chars().next().unwrap_or('`');
    enigo.key(enigo::Key::Unicode(open_console_char), Direction::Click).map_err(|e| format!("发送按键失败 {:?}", e))?;
    std::thread::sleep(std::time::Duration::from_millis(100));
    
    for char in command.chars() {
        match char {
            '_' => {
                let _ = enigo.key(enigo::Key::Shift, Direction::Press);
                std::thread::sleep(std::time::Duration::from_millis(10));
                let _ = enigo.key(enigo::Key::Unicode('-'), Direction::Click);
                std::thread::sleep(std::time::Duration::from_millis(10));
                let _ = enigo.key(enigo::Key::Shift, Direction::Release);
            },
            ' ' => {
                let _ = enigo.key(enigo::Key::Space, Direction::Click);
            },
            _ => {
                let _ = enigo.key(enigo::Key::Unicode(char), Direction::Click);
            }
        }
        std::thread::sleep(std::time::Duration::from_millis(15));
    }
    
    let _ = enigo.key(enigo::Key::Return, Direction::Click);
    std::thread::sleep(std::time::Duration::from_millis(100));
    
    // 关闭控制台固定使用 ` 键
    enigo.key(enigo::Key::Unicode('`'), Direction::Click)
        .unwrap_or_else(|e| {
            println!("警告 关闭控制台失败 {:?}", e);
        });
    
    println!("已发送命令到 CSGO {}", command);
    
    if command.contains("sv_cheats") {
        std::thread::sleep(std::time::Duration::from_millis(500));
        let enabled = command.contains("sv_cheats 1");
        *state.cheats_enabled.lock().unwrap() = enabled;
        return Ok(enabled);
    }
    
    Ok(true)
}

#[tauri::command]
fn launch_csgo() -> Result<(), String> {
    use std::process::Command;
    
    Command::new("cmd")
        .args(["/c", "start", "steam://rungameid/4465480"])
        .spawn()
        .map_err(|e| format!("启动失败：{}", e))?;
    
    Ok(())
}

#[tauri::command]
fn get_settings() -> AppSettings {
    AppSettings::load()
}

#[tauri::command]
fn save_settings(menu_shortcut: String, console_key: String) -> Result<String, String> {
    // 更新全局快捷键按键
    let shortcut_char = menu_shortcut.chars().next().unwrap_or('P');
    let new_vk = match shortcut_char {
        // 字母 A-Z
        'A' | 'a' => 0x41, 'B' | 'b' => 0x42, 'C' | 'c' => 0x43, 'D' | 'd' => 0x44,
        'E' | 'e' => 0x45, 'F' | 'f' => 0x46, 'G' | 'g' => 0x47, 'H' | 'h' => 0x48,
        'I' | 'i' => 0x49, 'J' | 'j' => 0x4A, 'K' | 'k' => 0x4B, 'L' | 'l' => 0x4C,
        'M' | 'm' => 0x4D, 'N' | 'n' => 0x4E, 'O' | 'o' => 0x4F, 'P' | 'p' => 0x50,
        'Q' | 'q' => 0x51, 'R' | 'r' => 0x52, 'S' | 's' => 0x53, 'T' | 't' => 0x54,
        'U' | 'u' => 0x55, 'V' | 'v' => 0x56, 'W' | 'w' => 0x57, 'X' | 'x' => 0x58,
        'Y' | 'y' => 0x59, 'Z' | 'z' => 0x5A,
        // 数字 0-9
        '0' => 0x30, '1' => 0x31, '2' => 0x32, '3' => 0x33, '4' => 0x34,
        '5' => 0x35, '6' => 0x36, '7' => 0x37, '8' => 0x38, '9' => 0x39,
        // F1-F12
        '₁' => 0x70, '₂' => 0x71, '₃' => 0x72, '₄' => 0x73, '₅' => 0x74, '₆' => 0x75,
        '₇' => 0x76, '₈' => 0x77, '₉' => 0x78, '₊' => 0x79, '₋' => 0x7A, '₌' => 0x7B,
        // 特殊键
        '`' | '~' => 0xC0, '-' | '_' => 0xBD, '=' | '+' => 0xBB,
        '[' | '{' => 0xDB, ']' | '}' => 0xDD, '\\' | '|' => 0xDC,
        ';' | ':' => 0xBA, '\'' | '"' => 0xDE, ',' | '<' => 0xBC,
        '.' | '>' => 0xBE, '/' | '?' => 0xBF,
        // 功能键
        ' ' => 0x20, // Space
        _ => 0x50, // 默认 P
    };
    SHORTCUT_KEY.store(new_vk, Ordering::Relaxed);
    
    let settings = AppSettings {
        menu_shortcut,
        console_key,
    };
    let result = settings.save()?;
    Ok(result)
}

#[tauri::command]
fn check_window(state: State<AppState>) -> Result<bool, String> {
    let hwnd_val = state.cached_hwnd.load(Ordering::Relaxed);
    if hwnd_val != 0 {
        return Ok(true);
    }
    
    let hwnd = find_csgo_window()?;
    state.cached_hwnd.store(hwnd.0 as u64, Ordering::Relaxed);
    Ok(true)
}

// 查找 CSGO 窗口
fn find_csgo_window() -> Result<HWND, String> {
    use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowTextLengthA, GetWindowTextA};
    
    struct WindowFinder {
        target_title: &'static str,
        found_hwnd: Option<HWND>,
    }
    
    unsafe extern "system" fn enum_windows_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
        let finder = &mut *(lparam.0 as *mut WindowFinder);
        
        let len = GetWindowTextLengthA(hwnd);
        if len > 0 {
            let mut buffer = vec![0u8; len as usize + 1];
            let written = GetWindowTextA(hwnd, &mut buffer);
            if written > 0 {
                if let Ok(title) = std::str::from_utf8(&buffer[..written as usize]) {
                    if title.contains(finder.target_title) {
                        finder.found_hwnd = Some(hwnd);
                        return false.into();
                    }
                }
            }
        }
        true.into()
    }
    
    let mut finder = WindowFinder {
        target_title: "Counter-Strike: Global Offensive",
        found_hwnd: None,
    };
    
    unsafe {
        EnumWindows(Some(enum_windows_proc), LPARAM(&mut finder as *mut _ as isize)).ok();
    }
    
    if let Some(hwnd) = finder.found_hwnd {
        println!("找到 CSGO 窗口");
        return Ok(hwnd);
    }
    
    Err("未找到 CSGO 窗口 请确保游戏已启动".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let settings = AppSettings::load();
    println!("启动时加载的配置：{:?}", settings);
    
    // 初始化快捷键
    let shortcut_char = settings.menu_shortcut.chars().next().unwrap_or('P');
    let initial_vk = match shortcut_char {
        // 字母 A-Z
        'A' | 'a' => 0x41, 'B' | 'b' => 0x42, 'C' | 'c' => 0x43, 'D' | 'd' => 0x44,
        'E' | 'e' => 0x45, 'F' | 'f' => 0x46, 'G' | 'g' => 0x47, 'H' | 'h' => 0x48,
        'I' | 'i' => 0x49, 'J' | 'j' => 0x4A, 'K' | 'k' => 0x4B, 'L' | 'l' => 0x4C,
        'M' | 'm' => 0x4D, 'N' | 'n' => 0x4E, 'O' | 'o' => 0x4F, 'P' | 'p' => 0x50,
        'Q' | 'q' => 0x51, 'R' | 'r' => 0x52, 'S' | 's' => 0x53, 'T' | 't' => 0x54,
        'U' | 'u' => 0x55, 'V' | 'v' => 0x56, 'W' | 'w' => 0x57, 'X' | 'x' => 0x58,
        'Y' | 'y' => 0x59, 'Z' | 'z' => 0x5A,
        // 数字 0-9
        '0' => 0x30, '1' => 0x31, '2' => 0x32, '3' => 0x33, '4' => 0x34,
        '5' => 0x35, '6' => 0x36, '7' => 0x37, '8' => 0x38, '9' => 0x39,
        // F1-F12
        '₁' => 0x70, '₂' => 0x71, '₃' => 0x72, '₄' => 0x73, '₅' => 0x74, '₆' => 0x75,
        '₇' => 0x76, '₈' => 0x77, '₉' => 0x78, '₊' => 0x79, '₋' => 0x7A, '₌' => 0x7B,
        // 特殊键
        '`' | '~' => 0xC0, '-' | '_' => 0xBD, '=' | '+' => 0xBB,
        '[' | '{' => 0xDB, ']' | '}' => 0xDD, '\\' | '|' => 0xDC,
        ';' | ':' => 0xBA, '\'' | '"' => 0xDE, ',' | '<' => 0xBC,
        '.' | '>' => 0xBE, '/' | '?' => 0xBF,
        // 功能键
        ' ' => 0x20, // Space
        _ => 0x50, // 默认 P
    };
    SHORTCUT_KEY.store(initial_vk, Ordering::Relaxed);
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![toggle_menu, send_console_command, check_window, get_settings, save_settings, launch_csgo])
        .setup(move |app| {
            // 设置全局快捷键监听
            let handle = app.handle().clone();
            
            std::thread::spawn(move || {
                let mut last_state = false;
                loop {
                    let current_state = unsafe {
                        use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState};
                        let vk_code = SHORTCUT_KEY.load(Ordering::Relaxed) as u32;
                        (GetAsyncKeyState(vk_code as i32) as u16) & 0x8000u16 != 0
                    };
                    
                    // 检测按键按下瞬间
                    if current_state && !last_state {
                        // 立即设置前景窗口，阻止按键传递
                        if let Some(window) = handle.get_webview_window("main") {
                            if let Ok(hwnd_ptr) = window.hwnd() {
                                unsafe {
                                    use windows::Win32::UI::WindowsAndMessaging::SetForegroundWindow;
                                    let _ = SetForegroundWindow(HWND(hwnd_ptr.0));
                                }
                            }
                        }
                        
                        // 等待按键释放
                        std::thread::sleep(std::time::Duration::from_millis(100));
                        while unsafe {
                            use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState};
                            let vk_code = SHORTCUT_KEY.load(Ordering::Relaxed) as u32;
                            (GetAsyncKeyState(vk_code as i32) as u16) & 0x8000u16 != 0
                        } {
                            std::thread::sleep(std::time::Duration::from_millis(50));
                        }
                        
                        // 额外延迟确保系统不响应
                        std::thread::sleep(std::time::Duration::from_millis(100));
                        
                        if let Some(window) = handle.get_webview_window("main") {
                            let _ = toggle_menu(window);
                        }
                    }
                    
                    last_state = current_state;
                    std::thread::sleep(std::time::Duration::from_millis(10));
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
