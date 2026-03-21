import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { invoke } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Sword,
  Zap,
  Home,
  Github
} from "lucide-react"
import { HomeTab } from "./tabs/HomeTab"
import { FeaturesTab } from "./tabs/FeaturesTab"
import { WeaponsTab } from "./tabs/WeaponsTab"
import { SettingsTab } from "./tabs/SettingsTab"
import { toast } from "sonner"

interface AppSettings {
  menu_shortcut: string
  console_key: string
}

export function CSGOMenu() {
  const [cheatsEnabled, setCheatsEnabled] = useState(false)
  const [csgoWindowFound, setCsgoWindowFound] = useState<boolean | null>(null)
  const [godMode, setGodMode] = useState(false)
  const [infiniteAmmo, setInfiniteAmmo] = useState(false)
  const [infiniteGrenades, setInfiniteGrenades] = useState(false)
  const [noReload, setNoReload] = useState(false)
  const [customCommand, setCustomCommand] = useState("")
  const [consoleKey, setConsoleKey] = useState("`")

  // 发送命令到 CSGO 控制台
  const sendToConsole = async (command: string) => {
    try {
      const result = await invoke<boolean>("send_console_command", { command, consoleKey })
        
      if (command.includes("sv_cheats")) {
        if (result === true) {
          setCheatsEnabled(true)
          toast.success("作弊模式已启用")
        } else {
          setCheatsEnabled(false)
          toast.error("作弊模式未启用或已禁用")
        }
      } else {
        toast.success(`命令已发送：${command}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      toast.error(`发送失败：${errorMsg}`)
      console.error("Failed to send command:", error)
    }
  }

  const enableCheats = async () => {
    await sendToConsole("sv_cheats 1")
    setCheatsEnabled(true)
  }

  const toggleGodMode = async () => {
    const newMode = !godMode
    setGodMode(newMode)
    await sendToConsole("god")
  }

  const toggleInfiniteAmmo = async () => {
    const newVal = !infiniteAmmo
    setInfiniteAmmo(newVal)
    await sendToConsole(newVal ? "sv_infiniteammo 1" : "sv_infiniteammo 0")
  }
  
  const resetAll = () => {
    window.location.reload()
  }

  const toggleInfiniteGrenades = async () => {
    const newVal = !infiniteGrenades
    setInfiniteGrenades(newVal)
    await sendToConsole(newVal ? "sv_infinite_grenades 1" : "sv_infinite_grenades 0")
  }

  const toggleNoReload = async () => {
    const newVal = !noReload
    setNoReload(newVal)
    if (newVal) {
      await sendToConsole("weapon_auto_cleanup_time 9999")
    }
  }

  // 检查 CSGO 窗口是否存在
  const checkCsgoWindow = async () => {
    try {
      await invoke("check_window")
      setCsgoWindowFound(true)
    } catch (error) {
      setCsgoWindowFound(false)
    }
  }

  // 初始化时检查窗口和加载设置
  useEffect(() => {
    checkCsgoWindow()
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await invoke<AppSettings>("get_settings")
      console.log("加载到的配置:", settings)
      setConsoleKey(settings.console_key)
      console.log("设置 consoleKey 为:", settings.console_key)
    } catch (error) {
      console.error("加载设置失败:", error)
    }
  }

  const handleCustomCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (customCommand.trim()) {
      await sendToConsole(customCommand.trim())
      setCustomCommand("")
    }
  }

  const launchGame = async () => {
    try {
      await invoke("launch_csgo")
      toast.success("正在启动 CSGO...")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      toast.error(`启动失败：${errorMsg}`)
    }
  }

  return (
    <div className="w-full max-w-[500px] mx-auto">
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="home">
            <Home className="h-4 w-4 mr-1" />
            首页
          </TabsTrigger>
          <TabsTrigger
            value="features"
            disabled={!cheatsEnabled}
            onClick={() => {
              if (!cheatsEnabled) {
                toast.error('请先在首页启用作弊模式')
              }
            }}
          >
            <Zap className="h-4 w-4 mr-1" />
            功能
          </TabsTrigger>
          <TabsTrigger
            value="weapons"
            disabled={!cheatsEnabled}
            onClick={() => {
              if (!cheatsEnabled) {
                toast.error('请先在首页启用作弊模式')
              }
            }}
          >
            <Sword className="h-4 w-4 mr-1" />
            武器
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1" />
            设置
          </TabsTrigger>
          <a href="https://github.com/YuiNijika/CSGOConsoleMenu" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="h-9 px-3">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </a>
        </TabsList>
        <div className="p-4">
          {/* 首页 Tab */}
          <TabsContent value="home">
            <HomeTab
              cheatsEnabled={cheatsEnabled}
              csgoWindowFound={csgoWindowFound}
              onEnableCheats={enableCheats}
              onToggleGodMode={toggleGodMode}
              onToggleInfiniteAmmo={toggleInfiniteAmmo}
              godMode={godMode}
              infiniteAmmo={infiniteAmmo}
              customCommand={customCommand}
              onCommandChange={setCustomCommand}
              onSubmit={handleCustomCommand}
              onReset={resetAll}
              onLaunchGame={launchGame}
            />
          </TabsContent>

          {/* 功能 Tab */}
          <TabsContent value="features">
            <FeaturesTab
              cheatsEnabled={cheatsEnabled}
              godMode={godMode}
              infiniteAmmo={infiniteAmmo}
              infiniteGrenades={infiniteGrenades}
              noReload={noReload}
              onToggleGodMode={toggleGodMode}
              onToggleInfiniteAmmo={toggleInfiniteAmmo}
              onToggleInfiniteGrenades={toggleInfiniteGrenades}
              onToggleNoReload={toggleNoReload}
              onSendCommand={sendToConsole}
            />
          </TabsContent>

          {/* 武器 Tab */}
          <TabsContent value="weapons">
            <WeaponsTab
              cheatsEnabled={cheatsEnabled}
              onSendCommand={sendToConsole}
            />
          </TabsContent>

          {/* 设置 Tab */}
          <TabsContent value="settings">
            <SettingsTab onConsoleKeyChange={(key) => setConsoleKey(key)} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
