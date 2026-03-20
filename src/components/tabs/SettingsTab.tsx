import { Terminal, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { invoke } from "@tauri-apps/api/core"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface SettingsTabProps {
  onCommandChange?: (value: string) => void
  onSubmit?: (e: React.FormEvent) => void
}

interface AppSettings {
  menu_shortcut: string
  console_key: string
}

export function SettingsTab({
}: SettingsTabProps) {
  const [menuShortcut, setMenuShortcut] = useState("P")
  const [consoleKey, setConsoleKey] = useState("`")

  // 加载设置
  useEffect(() => {
    loadSettings()
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
