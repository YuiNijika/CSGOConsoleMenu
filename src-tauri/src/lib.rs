use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use tauri::{Manager, State};
use windows::Win32::UI::WindowsAndMessaging::{SetForegroundWindow, ShowWindow, SW_RESTORE};
use windows::Win32::Foundation::{HWND, LPARAM, BOOL};
use enigo::{Enigo, Settings, Keyboard, Direction};
use std::sync::Mutex;

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

#[tauri::command]
fn toggle_menu(window: tauri::WebviewWindow) -> bool {
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
fn send_console_command(command: String, state: State<AppState>) -> Result<bool, String> {
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
    
    enigo.key(enigo::Key::Unicode('`'), Direction::Click).map_err(|e| format!("发送按键失败 {:?}", e))?;
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
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![toggle_menu, send_console_command, check_window])
        .setup(|app| {
            // 设置全局快捷键监听
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                loop {
                    // 监听 P 键 (虚拟键码 0x50)
                    if unsafe {
                        use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState, VK_P};
                        GetAsyncKeyState(VK_P.0 as i32) < 0
                    } {
                        std::thread::sleep(std::time::Duration::from_millis(100));
                        if let Some(window) = handle.get_webview_window("main") {
                            let _ = toggle_menu(window);
                        }
                        // 等待按键释放
                        while unsafe {
                            use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState, VK_P};
                            GetAsyncKeyState(VK_P.0 as i32) < 0
                        } {
                            std::thread::sleep(std::time::Duration::from_millis(50));
                        }
                    }
                    std::thread::sleep(std::time::Duration::from_millis(10));
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
