import { Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { invoke } from "@tauri-apps/api/core"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface SettingsTabProps {
  onConsoleKeyChange?: (value: string) => void
}

interface AppSettings {
  menu_shortcut: string
  console_key: string
}

export function SettingsTab({
  onConsoleKeyChange,
}: SettingsTabProps) {
  const [menuShortcut, setMenuShortcut] = useState("P")
  const [consoleKey, setConsoleKey] = useState("`")
  const [isLoaded, setIsLoaded] = useState(false)

  // 加载设置（只在组件首次挂载时执行一次）
  useEffect(() => {
    if (!isLoaded) {
      loadSettings()
      setIsLoaded(true)
    }
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await invoke<AppSettings>("get_settings")
      setMenuShortcut(settings.menu_shortcut)
      setConsoleKey(settings.console_key)
    } catch (error) {
      console.error("加载设置失败:", error)
    }
  }

  const handleSaveSettings = async () => {
    try {
      await invoke<string>("save_settings", {
        menuShortcut: menuShortcut.toUpperCase(),
        consoleKey: consoleKey
      })
      toast.success("设置已保存")
      // 通知父组件更新状态
      if (onConsoleKeyChange) {
        onConsoleKeyChange(consoleKey)
      }
    } catch (error) {
      toast.error(`保存失败 ${error}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* 快捷键设置 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Keyboard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">快捷键设置</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">菜单开关快捷键</label>
            <Input
              value={menuShortcut}
              onChange={(e) => setMenuShortcut(e.target.value.toUpperCase())}
              placeholder="例如：P"
              maxLength={1}
              className="uppercase"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">控制台按键</label>
            <Input
              value={consoleKey}
              onChange={(e) => setConsoleKey(e.target.value)}
              placeholder="例如：`"
              maxLength={1}
            />
          </div>
        </div>
        
        <Button onClick={handleSaveSettings} size="sm" className="w-full">
          保存设置
        </Button>
      </div>
    </div>
  )
}
