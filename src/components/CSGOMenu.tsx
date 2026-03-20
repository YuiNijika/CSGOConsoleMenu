import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { invoke } from "@tauri-apps/api/core"
import {
  Settings,
  Sword,
  Zap,
  Home
} from "lucide-react"
import { HomeTab } from "./tabs/HomeTab"
import { FeaturesTab } from "./tabs/FeaturesTab"
import { WeaponsTab } from "./tabs/WeaponsTab"
import { SettingsTab } from "./tabs/SettingsTab"

export function CSGOMenu() {
  const [cheatsEnabled, setCheatsEnabled] = useState(false)
  const [csgoWindowFound, setCsgoWindowFound] = useState<boolean | null>(null)
  const [godMode, setGodMode] = useState(false)
  const [infiniteAmmo, setInfiniteAmmo] = useState(false)
  const [infiniteGrenades, setInfiniteGrenades] = useState(false)
  const [noReload, setNoReload] = useState(false)
  const [customCommand, setCustomCommand] = useState("")
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [isError, setIsError] = useState(false)

  // 发送命令到 CSGO 控制台
  const sendToConsole = async (command: string) => {
    try {
      setStatusMessage("正在发送命令")
      setIsError(false)
      const result = await invoke<boolean>("send_console_command", { command })

      if (command.includes("sv_cheats")) {
        if (result === true) {
          setCheatsEnabled(true)
          setStatusMessage("作弊模式已启用")
          setIsError(false)
        } else {
          setCheatsEnabled(false)
          setStatusMessage("作弊模式未启用或已禁用")
          setIsError(true)
        }
      } else {
        setStatusMessage(`命令已发送 ${command}`)
        setIsError(false)
      }

      setTimeout(() => setStatusMessage(""), 2000)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      setStatusMessage(` 发送失败 ${errorMsg}`)
      setIsError(true)
      console.error("Failed to send command:", error)
      setTimeout(() => setStatusMessage(""), 3000)
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
    await sendToConsole(newVal ? "sv_infinite_ammo 1" : "sv_infinite_ammo 0")
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

  // 初始化时检查窗口
  useEffect(() => {
    checkCsgoWindow()
  }, [])

  const handleCustomCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (customCommand.trim()) {
      await sendToConsole(customCommand.trim())
      setCustomCommand("")
    }
  }

  // 武器相关命令
  const giveWeapon = async (weapon: string) => {
    await sendToConsole(`give ${weapon}`)
  }

  return (
    <div className="w-full max-w-[500px] mx-auto">
      {/* 状态提示 */}
      {statusMessage && (
        <div className={`text-xs py-1 px-2 rounded ${isError
          ? 'bg-destructive/10 text-destructive'
          : 'bg-green-500/10 text-green-600'
          }`}>
          {statusMessage}
        </div>
      )}

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home">
            <Home className="h-4 w-4 mr-1" />
            首页
          </TabsTrigger>
          <TabsTrigger
            value="features"
            disabled={!cheatsEnabled}
            onClick={() => {
              if (!cheatsEnabled) {
                setStatusMessage('请先在首页启用作弊模式')
                setIsError(true)
                setTimeout(() => setStatusMessage(''), 2000)
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
                setStatusMessage('请先在首页启用作弊模式')
                setIsError(true)
                setTimeout(() => setStatusMessage(''), 2000)
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
            />
          </TabsContent>

          {/* 武器 Tab */}
          <TabsContent value="weapons">
            <WeaponsTab
              cheatsEnabled={cheatsEnabled}
              onGiveWeapon={giveWeapon}
            />
          </TabsContent>

          {/* 设置 Tab */}
          <TabsContent value="settings">
            <SettingsTab
              customCommand={customCommand}
              onCommandChange={setCustomCommand}
              onSubmit={handleCustomCommand}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
