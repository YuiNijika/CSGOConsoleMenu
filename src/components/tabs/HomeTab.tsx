import { AlertTriangle, Shield, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HomeTabProps {
  cheatsEnabled: boolean
  csgoWindowFound: boolean | null
  onEnableCheats: () => void
  onToggleGodMode: () => void
  onToggleInfiniteAmmo: () => void
  godMode: boolean
  infiniteAmmo: boolean
}

export function HomeTab({
  cheatsEnabled,
  csgoWindowFound,
  onEnableCheats,
  onToggleGodMode,
  onToggleInfiniteAmmo,
  godMode,
  infiniteAmmo,
}: HomeTabProps) {
  if (csgoWindowFound === false) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
          <div>
            <p className="text-sm text-red-600 dark:text-red-400">
              请启动 Counter-Strike: Global Offensive 游戏
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!cheatsEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
          <div>
            <p className="font-medium text-yellow-700 dark:text-yellow-500">
              需要先启用作弊模式
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              点击下方按钮启用 sv_cheats 1
            </p>
          </div>
        </div>
        <Button 
          onClick={onEnableCheats} 
          className="w-full"
          size="lg"
        >
          <Shield className="h-4 w-4 mr-2" />
          启用作弊模式
        </Button>
      </div>
    )
  }

  // 已启用作弊
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
        <div>
          <p className="font-medium text-green-700 dark:text-green-500">
            作弊模式已启用
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            可以开始使用所有功能
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={onToggleGodMode} variant={godMode ? "default" : "outline"}>
          无敌模式 {godMode && <CheckCircle className="h-4 w-4 ml-1" />}
        </Button>
        <Button onClick={onToggleInfiniteAmmo} variant={infiniteAmmo ? "default" : "outline"}>
          无限弹药 {infiniteAmmo && <CheckCircle className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </div>
  )
}
