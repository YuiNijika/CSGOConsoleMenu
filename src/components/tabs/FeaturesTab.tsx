import { Shield, Crosshair, Target, Settings } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface FeaturesTabProps {
  cheatsEnabled: boolean
  godMode: boolean
  infiniteAmmo: boolean
  infiniteGrenades: boolean
  noReload: boolean
  onToggleGodMode: () => void
  onToggleInfiniteAmmo: () => void
  onToggleInfiniteGrenades: () => void
  onToggleNoReload: () => void
}

export function FeaturesTab({
  cheatsEnabled,
  godMode,
  infiniteAmmo,
  infiniteGrenades,
  noReload,
  onToggleGodMode,
  onToggleInfiniteAmmo,
  onToggleInfiniteGrenades,
  onToggleNoReload,
}: FeaturesTabProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">无敌模式</span>
        </div>
        <Switch checked={godMode} onCheckedChange={onToggleGodMode} disabled={!cheatsEnabled} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">无限弹药</span>
        </div>
        <Switch checked={infiniteAmmo} onCheckedChange={onToggleInfiniteAmmo} disabled={!cheatsEnabled} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">无限手雷</span>
        </div>
        <Switch checked={infiniteGrenades} onCheckedChange={onToggleInfiniteGrenades} disabled={!cheatsEnabled} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">无需换弹</span>
        </div>
        <Switch checked={noReload} onCheckedChange={onToggleNoReload} disabled={!cheatsEnabled} />
      </div>
    </div>
  )
}
