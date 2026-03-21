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
  { name: "十倍速", command: "host_timescale", defaultValue: "10", needsInput: true },
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
  { name: "投掷轨迹", commandOn: "sv_grenade_trajectory 1", commandOff: "sv_grenade_trajectory 0" },
  { name: "轨迹保留 30s", commandOn: "cl_sim_grenade_trajectory 30", commandOff: "cl_sim_grenade_trajectory 0" },
  { name: "投掷预览", commandOn: "cl_grenadepreview 1", commandOff: "cl_grenadepreview 0" },
  { name: "雷达全显", commandOn: "mp_radar_showall 1", commandOff: "mp_radar_showall 0" },
  { name: "语音互通", commandOn: "sv_alltalk 1", commandOff: "sv_alltalk 0" },
  { name: "自动回血", commandOn: "sv_regeneration_force_on 1", commandOff: "sv_regeneration_force_on 0" },
  { name: "取消坠落伤", commandOn: "sv_falldamage_scale 0", commandOff: "sv_falldamage_scale 1" },
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
  { name: "踢出所有 BOT", command: "bot_kick" },
  { name: "结束热身", command: "mp_warmup_end" },
  { name: "无限购买时间", command: "mp_buytime 9999" },
  { name: "回合 60 分钟", command: "mp_roundtime 60" },
  { name: "竞技 60 分钟", command: "mp_roundtime_defuse 60" },
  { name: "死亡复活 CT", command: "mp_respawn_on_death_ct 1" },
  { name: "死亡复活 T", command: "mp_respawn_on_death_t 1" },
  { name: "CT5 秒复活", command: "mp_respawnwavetime_ct 5" },
  { name: "T5 秒复活", command: "mp_respawnwavetime_t 5" },
  { name: "禁用胜利条件", command: "mp_ignore_round_win_conditions 1" },
  { name: "禁止穿队友", command: "mp_solid_teammates 1" },
  { name: "武器高亮", command: "mp_weapons_glow_on_ground 1" },
  { name: "关闭自动踢出", command: "mp_autokick 0" },
  { name: "观战位 5", command: "mp_spectators_max 5" },
  { name: "雷达显示所有人", command: "mp_radar_showall 1" },
]

const equipmentCommands: { name: string; command: string }[] = []

const mapData = {
  activeDuty: [
    { name: "远古遗迹", value: "de_ancient" },
    { name: "阿努比斯", value: "de_anubis" },
    { name: "炼狱小镇", value: "de_inferno" },
    { name: "荒漠迷城", value: "de_mirage" },
    { name: "核子危机", value: "de_nuke" },
    { name: "死亡游乐园", value: "de_overpass" },
    { name: "殒命大厦", value: "de_vertigo" },
  ] as Array<{ name: string; value: string }>,
  reserves: [
    { name: "死城之谜", value: "de_cache" },
    { name: "炙热沙城 2", value: "de_dust2" },
    { name: "列车停放站", value: "de_train" },
    { name: "托斯卡纳", value: "de_tuscan" },
  ] as Array<{ name: string; value: string }>,
  community: [
    { name: "运河水城", value: "de_canals" },
    { name: "短版炙热沙城", value: "de_shortdust" },
    { name: "短版核子危机", value: "de_shortnuke" },
    { name: "湖畔激战", value: "de_lake" },
    { name: "金库危机", value: "de_bank" },
    { name: "安全住所", value: "de_safehouse" },
    { name: "圣马克镇", value: "de_st_marc" },
    { name: "甘蔗田", value: "de_sugarcane" },
    { name: "行李仓库", value: "de_baggage" },
    { name: "眩晕大厦", value: "de_dizzy" },
    { name: "博涯堡垒", value: "de_boyard" },
    { name: "圣杯村庄", value: "de_chalice" },
  ] as Array<{ name: string; value: string }>,
  dangerZone: [
    { name: "神秘小镇", command: "map dz_blacksite" },
    { name: "西洛可", command: "map dz_sirocco" },
    { name: "余烬岛", command: "map dz_ember" },
    { name: "葡萄庄园", command: "map dz_vineyard" },
  ] as Array<{ name: string; command: string }>,
}

export function FeaturesTab({
  cheatsEnabled,
  godMode,
  infiniteAmmo,
  onToggleGodMode,
  onToggleInfiniteAmmo,
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
      <Accordion type="single" collapsible className="w-full" defaultValue="core">
        {/* 核心功能 */}
        <AccordionItem value="core">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>核心功能</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button 
                onClick={onToggleGodMode} 
                variant={godMode ? "default" : "outline"}
                disabled={!cheatsEnabled}
                className="w-full"
              >
                无敌模式 {godMode && <CheckCircle className="h-4 w-4 ml-1" />}
              </Button>
              <Button 
                onClick={onToggleInfiniteAmmo} 
                variant={infiniteAmmo ? "default" : "outline"}
                disabled={!cheatsEnabled}
                className="w-full"
              >
                无限弹药 {infiniteAmmo && <CheckCircle className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
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

        {/* 更换地图 */}
        <AccordionItem value="maps">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>更换地图</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {/* 现役地图组 */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">现役地图组</div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {mapData.activeDuty.map((map) => (
                    <Button
                      key={map.name}
                      onClick={() => onSendCommand(`map ${map.value}`)}
                      variant="outline"
                      size="sm"
                      disabled={!cheatsEnabled}
                      className="w-full"
                    >
                      {map.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 后备地图组 */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">后备地图组</div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {mapData.reserves.map((map) => (
                    <Button
                      key={map.name}
                      onClick={() => onSendCommand(`map ${map.value}`)}
                      variant="outline"
                      size="sm"
                      disabled={!cheatsEnabled}
                      className="w-full"
                    >
                      {map.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 社区/休闲地图 */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">社区/休闲地图</div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {mapData.community.map((map) => (
                    <Button
                      key={map.name}
                      onClick={() => onSendCommand(`map ${map.value}`)}
                      variant="outline"
                      size="sm"
                      disabled={!cheatsEnabled}
                      className="w-full"
                    >
                      {map.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 头号特训地图 */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">头号特训</div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {mapData.dangerZone.map((map) => (
                    <Button
                      key={map.name}
                      onClick={() => onSendCommand(map.command)}
                      variant="outline"
                      size="sm"
                      disabled={!cheatsEnabled}
                      className="w-full"
                    >
                      {map.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
