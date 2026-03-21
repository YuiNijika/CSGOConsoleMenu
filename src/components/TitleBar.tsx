import { X, Minus } from "lucide-react"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"

interface TitleBarProps {
  title?: string
}

export function TitleBar({ title = "CSGO Console Menu By 鼠子·YuiNijika" }: TitleBarProps) {
  const minimize = async () => {
    try {
      await getCurrentWebviewWindow().minimize()
    } catch (error) {
      console.error("Failed to minimize window:", error)
    }
  }

  const close = async () => {
    try {
      await getCurrentWebviewWindow().close()
    } catch (error) {
      console.error("Failed to close window:", error)
    }
  }

  return (
    <div 
      className="h-10 bg-secondary flex items-center justify-between px-3 select-none cursor-grab active:cursor-grabbing"
      data-tauri-drag-region
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <img src="/csgo.svg" alt="CSGO" className="h-5 w-5" />
        <span className="text-sm font-medium text-secondary-foreground">{title}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={minimize}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent transition-colors"
          title="最小化"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={close}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
          title="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
