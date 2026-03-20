import { Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SettingsTabProps {
  customCommand: string
  onCommandChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function SettingsTab({
  customCommand,
  onCommandChange,
  onSubmit,
}: SettingsTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">自定义命令</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={customCommand}
          onChange={(e) => onCommandChange(e.target.value)}
          placeholder="输入控制台命令..."
          className="flex-1"
        />
        <Button type="submit" size="sm">
          发送
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        💡 自动执行：打开控制台 → 输入命令 → 关闭控制台
      </p>
    </form>
  )
}
