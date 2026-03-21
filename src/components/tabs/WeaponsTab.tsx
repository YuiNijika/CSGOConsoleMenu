import { Sword, Shield, Zap, Skull, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface WeaponsTabProps {
  cheatsEnabled: boolean
  onSendCommand: (command: string) => void
}

interface WeaponItem {
  name: string
  command: string
}

const weaponsData = {
  default: [
    { name: "CT 主武器", command: "mp_ct_default_primary weapon_ak47" },
    { name: "CT 副武器", command: "mp_ct_default_secondary weapon_usp_silencer" },
    { name: "T 主武器", command: "mp_t_default_primary weapon_ak47" },
    { name: "T 副武器", command: "mp_t_default_secondary weapon_deagle" },
    { name: "全甲", command: "mp_free_armor 2" },
    { name: "掉落手雷", command: "mp_death_drop_grenade 0" },
    { name: "无限弹药", command: "sv_infinite_ammo 1" },
    { name: "最大投掷物", command: "ammo_grenade_limit_total 6" },
    { name: "接触武器显示", command: "mp_items_prohibited 0" },
    { name: "T 默认手雷", command: "mp_t_default_grenades weapon_flashbang weapon_hegrenade weapon_smokegrenade weapon_molotov weapon_decoy" },
    { name: "CT 默认手雷", command: "mp_ct_default_grenades weapon_flashbang weapon_hegrenade weapon_smokegrenade weapon_incgrenade weapon_decoy" },
  ] as WeaponItem[],
  pistols: [
    { name: "格洛克 18", command: "give weapon_glock" },
    { name: "P2000", command: "give weapon_hkp2000" },
    { name: "USP 消音", command: "give weapon_usp_silencer" },
    { name: "双持贝瑞塔", command: "give weapon_elite" },
    { name: "P250", command: "give weapon_p250" },
    { name: "FN57", command: "give weapon_fiveseven" },
    { name: "TEC-9", command: "give weapon_tec9" },
    { name: "CZ75", command: "give weapon_cz75a" },
    { name: "沙漠之鹰", command: "give weapon_deagle" },
    { name: "R8 左轮", command: "give weapon_revolver" },
  ] as WeaponItem[],
  heavy: [
    { name: "新星", command: "give weapon_nova" },
    { name: "XM1014", command: "give weapon_xm1014" },
    { name: "MAG-7", command: "give weapon_mag7" },
    { name: "截短霰弹", command: "give weapon_sawedoff" },
    { name: "M249", command: "give weapon_m249" },
    { name: "内格夫", command: "give weapon_negev" },
  ] as WeaponItem[],
  smg: [
    { name: "MP9", command: "give weapon_mp9" },
    { name: "MAC-10", command: "give weapon_mac10" },
    { name: "MP7", command: "give weapon_mp7" },
    { name: "MP5-SD", command: "give weapon_mp5sd" },
    { name: "UMP-45", command: "give weapon_ump45" },
    { name: "P90", command: "give weapon_p90" },
    { name: "PP-野牛", command: "give weapon_bizon" },
  ] as WeaponItem[],
  rifles: [
    { name: "加利尔 AR", command: "give weapon_galilar" },
    { name: "法玛斯", command: "give weapon_famas" },
    { name: "AK-47", command: "give weapon_ak47" },
    { name: "M4A4", command: "give weapon_m4a1" },
    { name: "M4A1 消音", command: "give weapon_m4a1_silencer" },
    { name: "SG 553", command: "give weapon_sg556" },
    { name: "AUG", command: "give weapon_aug" },
  ] as WeaponItem[],
  sniper: [
    { name: "SSG 08", command: "give weapon_ssg08" },
    { name: "AWP", command: "give weapon_awp" },
    { name: "G3SG1", command: "give weapon_g3sg1" },
    { name: "SCAR-20", command: "give weapon_scar20" },
  ] as WeaponItem[],
  grenades: [
    { name: "燃烧瓶", command: "give weapon_molotov" },
    { name: "燃烧弹", command: "give weapon_incgrenade" },
    { name: "诱饵弹", command: "give weapon_decoy" },
    { name: "闪光弹", command: "give weapon_flashbang" },
    { name: "高爆手雷", command: "give weapon_hegrenade" },
    { name: "烟雾弹", command: "give weapon_smokegrenade" },
  ] as WeaponItem[],
  equipment: [
    { name: "防弹背心", command: "give item_kevlar" },
    { name: "背心 + 头盔", command: "give item_assaultsuit" },
    { name: "电击枪", command: "give weapon_taser" },
    { name: "拆弹器", command: "give item_defuser" },
    { name: "营救工具", command: "give item_cutters" },
  ] as WeaponItem[],
  training: [
    { name: "医疗针", command: "give weapon_healthshot" },
    { name: "遥控 C4", command: "give weapon_breachcharge" },
    { name: "钱 (50 金)", command: "give item_cash" },
    { name: "特训助手", command: "give weapon_tablet" },
    { name: "弹射地雷", command: "give weapon_bumpmine" },
    { name: "防爆盾", command: "give weapon_shield" },
    { name: "Exo 跳跃", command: "exojump" },
    { name: "降落伞", command: "give parachute" },
    { name: "自动哨兵", command: "give dronegun" },
  ] as WeaponItem[],
  melee: [
    { name: "流浪者匕首", command: 'give weapon_knife_outdoor;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "骷髅匕首", command: 'give weapon_knife_skeleton;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "求生匕首", command: 'give weapon_knife_canis;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "系绳匕首", command: 'give weapon_knife_cord;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "海豹短刀", command: 'give weapon_knife_css;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "刺刀", command: 'give weapon_bayonet;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "折叠刀", command: 'give weapon_knife_flip;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "穿肠刀", command: 'give weapon_knife_gut;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "爪子刀", command: 'give weapon_knife_karambit;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "M9 刺刀", command: 'give weapon_knife_m9_bayonet;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "猎杀者匕首", command: 'give weapon_knife_tactical;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "蝴蝶刀", command: 'give weapon_knife_butterfly;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "弯刀", command: 'give weapon_knife_falchion;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "暗影双匕", command: 'give weapon_knife_push;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "鲍伊猎刀", command: 'give weapon_knife_survival_bowie;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "熊刀", command: 'give weapon_knife_ursus;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "折刀", command: 'give weapon_knife_gypsy_jackknife;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "短剑", command: 'give weapon_knife_stiletto;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "锯齿爪刀", command: 'give weapon_knife_widowmaker;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "金刀", command: 'give weapon_knifegg;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "幽灵之刃", command: 'give weapon_knife_ghost;ent_fire weapon_knife addoutput "classname weapon_knifegg"' },
    { name: "CT 默认匕首", command: "give weapon_knife" },
    { name: "T 默认匕首", command: "give weapon_knife_t" },
  ] as WeaponItem[],
  other: [
    { name: "战术探测雷", command: "give weapon_tagrenade" },
    { name: "雪球", command: "give weapon_snowball" },
    { name: "夜视仪", command: "give item_nvgs" },
    { name: "排斥装置", command: "give weapon_zone_repulsor" },
    { name: "鸡", command: "give chicken" },
    { name: "C4", command: "give weapon_c4" },
  ] as WeaponItem[],
}

export function WeaponsTab({
  cheatsEnabled,
  onSendCommand,
}: WeaponsTabProps) {
  return (
    <div className="space-y-2">
      {/* 顶部按钮 - 丢刀和解除武器限制 */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Button
          onClick={() => onSendCommand("mp_drop_knife_enable 1")}
          variant="outline"
          size="sm"
          disabled={!cheatsEnabled}
          className="w-full"
        >
          允许丢刀
        </Button>
        <Button
          onClick={() => onSendCommand("mp_weapons_allow_map_placed 1")}
          variant="outline"
          size="sm"
          disabled={!cheatsEnabled}
          className="w-full"
        >
          解除武器限制
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full" defaultValue="default">
        {/* 默认装备 */}
        <AccordionItem value="default">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>默认装备</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
              {weaponsData.default.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 手枪 */}
        <AccordionItem value="pistols">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Sword className="h-4 w-4 text-muted-foreground" />
              <span>手枪</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
              {weaponsData.pistols.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 重型武器 */}
        <AccordionItem value="heavy">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>重型武器</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
              {weaponsData.heavy.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 微型冲锋枪 */}
        <AccordionItem value="smg">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>微型冲锋枪</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
              {weaponsData.smg.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 步枪 */}
        <AccordionItem value="rifles">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Sword className="h-4 w-4 text-muted-foreground" />
              <span>步枪</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
              {weaponsData.rifles.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 狙击步枪 */}
        <AccordionItem value="sniper">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>狙击步枪</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
              {weaponsData.sniper.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 手雷/投掷物 */}
        <AccordionItem value="grenades">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Skull className="h-4 w-4 text-muted-foreground" />
              <span>手雷/投掷物</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
              {weaponsData.grenades.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 装备 */}
        <AccordionItem value="equipment">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>装备</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
              {weaponsData.equipment.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 头号特训道具 */}
        <AccordionItem value="training">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>头号特训</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
              {weaponsData.training.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 近战武器 */}
        <AccordionItem value="melee">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Sword className="h-4 w-4 text-muted-foreground" />
              <span>近战武器</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pt-2">
              {weaponsData.melee.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 其他 */}
        <AccordionItem value="other">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>其他</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
              {weaponsData.other.map((weapon) => (
                <Button
                  key={weapon.name}
                  onClick={() => onSendCommand(weapon.command)}
                  variant="outline"
                  size="sm"
                  disabled={!cheatsEnabled}
                  className="w-full"
                >
                  {weapon.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
