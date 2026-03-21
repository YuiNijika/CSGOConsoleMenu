import { Shield, Crosshair, Target, Settings, Zap, RefreshCw, Users, Sword, CheckCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useState } from "react"

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
  onSendCommand: (command: string) => void
}

interface VisualState {
  [key: string]: boolean
}

const physicsCommands = [
  { name: "空中加速", command: "sv_airaccelerate", defaultValue: "99999", needsInput: true },
  { name: "最大速度", command: "sv_maxvelocity", defaultValue: "99999", needsInput: true },
  { name: "减少延迟", command: "sv_jump_spam_penalty_time", defaultValue: "0", needsInput: true },
  { name: "启用连跳", command: "sv_enablebunnyhopping", defaultValue: "1", needsInput: false },
  { name: "自动连跳", command: "sv_autobunnyhopping", defaultValue: "1", needsInput: false },
  { name: "禁用疲劳成本", command: "sv_staminajumpcost", defaultValue: "0", needsInput: false },
  { name: "禁用落地疲劳", command: "sv_staminalandcost", defaultValue: "0", needsInput: false },
  { name: "无疲劳上限", command: "sv_staminamax", defaultValue: "0", needsInput: false },
  { name: "禁用疲劳恢复", command: "sv_staminarecoveryrate", defaultValue: "0", needsInput: false },
  { name: "禁用武器减速", command: "sv_accelerate_use_weapon_speed", defaultValue: "0", needsInput: false },
]

const visualCommands = [
  { name: "无后座力", commandOn: "weapon_accuracy_nospread 1;weapon_recoil_scale 0", commandOff: "weapon_accuracy_nospread 0;weapon_recoil_scale 1" },
  { name: "隔墙透视", commandOn: "mat_fillrate 1", commandOff: "mat_fillrate 0" },
  { name: "地形网格", commandOn: "mat_proxy 2", commandOff: "mat_proxy 0" },
  { name: "人物边框", commandOn: "mat_luxels 1", commandOff: "mat_luxels 0" },
  { name: "人物线框", commandOn: "r_drawrenderboxes 1", commandOff: "r_drawrenderboxes 0" },
  { name: "地图线框", commandOn: "r_drawothermodels 2", commandOff: "r_drawothermodels 1" },
  { name: "人物骨架", commandOn: "mat_wireframe 2", commandOff: "mat_wireframe 0" },
  { name: "显示骨骼", commandOn: "enable_skeleton_draw 1", commandOff: "enable_skeleton_draw 0" },
  { name: "关闭光影", commandOn: "mat_fullbright 1", commandOff: "mat_fullbright 0" },
  { name: "隐藏静态模型", commandOn: "r_drawstaticprops 0", commandOff: "r_drawstaticprops 1" },
  { name: "隐藏粒子", commandOn: "r_drawparticles 0", commandOff: "r_drawparticles 1" },
  { name: "烟雾范围", commandOn: "cl_particles_show_bbox 1", commandOff: "cl_particles_show_bbox 0" },
  { name: "金属人", commandOn: "r_showenvcubemap 1", commandOff: "r_showenvcubemap 0" },
]

const serverCommands = [
  { name: "重启游戏", command: "mp_restartgame 1" },
  { name: "重连服务器", command: "retry" },
  { name: "关闭自动平衡", command: "mp_autoteambalance 0" },
  { name: "人数平衡 (2)", command: "mp_limitteams 2" },
  { name: "最大金钱", command: "mp_maxmoney 16000" },
  { name: "出生金钱", command: "mp_startmoney 16000" },
  { name: "最大局数", command: "mp_maxrounds", defaultValue: "30", needsInput: true },
  { name: "随地购买", command: "mp_buy_anywhere 1" },
  { name: "C4 时间", command: "mp_c4timer", defaultValue: "45", needsInput: true },
  { name: "关闭友伤", command: "mp_friendlyfire 0" },
]

const equipmentCommands = [
  { name: "CT 主武器", command: "mp_ct_default_primary weapon_ak47" },
  { name: "CT 副武器", command: "mp_ct_default_secondary weapon_usp_silencer" },
  { name: "T 主武器", command: "mp_t_default_primary weapon_ak47" },
  { name: "T 副武器", command: "mp_t_default_secondary weapon_usp_silencer" },
  { name: "CT 投掷物", command: "mp_ct_default_grenades weapon_hegrenade weapon_incgrenade weapon_smokegrenade weapon_flashbang weapon_decoy" },
  { name: "T 投掷物", command: "mp_t_default_grenades weapon_hegrenade weapon_molotov weapon_smokegrenade weapon_flashbang weapon_decoy" },
  { name: "允许丢刀", command: "mp_drop_knife_enable 1" },
]

const knifeSubclassData = [
  { name: "刺刀", id: "500" },
  { name: "海豹短刀", id: "503" },
  { name: "折叠刀", id: "505" },
  { name: "穿肠刀", id: "506" },
  { name: "爪子刀", id: "507" },
  { name: "M9 刺刀", id: "508" },
  { name: "猎杀者", id: "509" },
  { name: "弯刀", id: "512" },
  { name: "鲍伊猎刀", id: "514" },
  { name: "蝴蝶刀", id: "515" },
  { name: "暗影双匕", id: "516" },
  { name: "系绳匕首", id: "517" },
  { name: "求生匕首", id: "518" },
  { name: "熊刀", id: "519" },
  { name: "折刀", id: "520" },
  { name: "流浪者匕首", id: "521" },
  { name: "短剑", id: "522" },
  { name: "锯齿爪刀", id: "523" },
  { name: "骷髅匕首", id: "525" },
  { name: "廓尔喀刀", id: "526" },
]

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
  onSendCommand,
}: FeaturesTabProps) {
  const [visualStates, setVisualStates] = useState<VisualState>({})

  const toggleVisual = (item: typeof visualCommands[0]) => {
    const currentState = visualStates[item.name] || false
    const newState = !currentState
    setVisualStates(prev => ({ ...prev, [item.name]: newState }))
    onSendCommand(newState ? item.commandOn : item.commandOff)
  }

  return (
    <div className="space-y-2">
      {/* 手风琴布局 */}
      <Accordion type="single" collapsible className="w-full" defaultValue="physics">
        {/* 物理设置 */}
        <AccordionItem value="physics">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>物理/连跳</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {physicsCommands.map((item) => (
                item.needsInput ? (
                  <Dialog key={item.command}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={!cheatsEnabled} className="w-full">
                        {item.name}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] w-[90vw]">
                      <DialogHeader>
                        <DialogTitle>{item.name}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Input
                          defaultValue={item.defaultValue}
                          placeholder="输入数值"
                          id={`input-${item.command}`}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button
                            onClick={() => {
                              const input = document.getElementById(`input-${item.command}`) as HTMLInputElement
                              if (input) {
                                onSendCommand(`${item.command} ${input.value}`)
                              }
                            }}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            应用
                          </Button>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    key={item.command}
                    onClick={() => onSendCommand(`${item.command} ${item.defaultValue}`)}
                    variant="outline"
                    size="sm"
                    disabled={!cheatsEnabled}
                    className="w-full"
                  >
                    {item.name}
                  </Button>
                )
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 视觉辅助 */}
        <AccordionItem value="visual">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>视觉辅助</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {visualCommands.map((item) => {
                const isActive = visualStates[item.name] || false
                return (
                  <Button
                    key={item.name}
                    onClick={() => toggleVisual(item)}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    disabled={!cheatsEnabled}
                    className="w-full"
                  >
                    {item.name} {isActive && <CheckCircle className="h-4 w-4 ml-1" />}
                  </Button>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 服务器指令 */}
        <AccordionItem value="server">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span>服务器指令</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {serverCommands.map((item) => (
                item.needsInput ? (
                  <Dialog key={item.command}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={!cheatsEnabled} className="w-full">
                        {item.name}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] w-[90vw]">
                      <DialogHeader>
                        <DialogTitle>{item.name}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Input
                          defaultValue={item.defaultValue}
                          placeholder="输入数值"
                          id={`input-server-${item.command}`}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button
                            onClick={() => {
                              const input = document.getElementById(`input-server-${item.command}`) as HTMLInputElement
                              if (input) {
                                onSendCommand(`${item.command} ${input.value}`)
                              }
                            }}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            应用
                          </Button>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    key={item.name}
                    onClick={() => onSendCommand(item.command)}
                    variant="outline"
                    size="sm"
                    disabled={!cheatsEnabled}
                    className="w-full"
                  >
                    {item.name}
                  </Button>
                )
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 默认装备 */}
        <AccordionItem value="equipment">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>默认装备</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {equipmentCommands.map((item) => (
                <Button
                  key={item.name}
                  onClick={() => onSendCommand(item.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 刀具替换 */}
        <AccordionItem value="knives">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Sword className="h-4 w-4 text-muted-foreground" />
              <span>刀具替换</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {knifeSubclassData.map((knife) => (
                <Button
                  key={knife.name}
                  onClick={() => onSendCommand(`subclass_create ${knife.id}`)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {knife.name}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <Button
                onClick={() => {
                  const subclassId = prompt("请输入要替换的刀 ID (例如：515 为蝴蝶刀):", "515")
                  if (subclassId !== null && subclassId.trim()) {
                    onSendCommand(`ent_fire weapon_knife changesubclass ${subclassId}`)
                  }
                }}
                variant="outline"
                size="sm"
                disabled={!cheatsEnabled}
                className="w-full"
              >
                替换手中刀 (输入 subclass ID)
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
