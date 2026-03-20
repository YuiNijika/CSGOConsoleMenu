import { Button } from "@/components/ui/button"

interface WeaponsTabProps {
  cheatsEnabled: boolean
  onGiveWeapon: (weapon: string) => void
}

export function WeaponsTab({ cheatsEnabled, onGiveWeapon }: WeaponsTabProps) {
  const weapons = [
    { name: "AK-47", id: "weapon_ak47" },
    { name: "M4A1", id: "weapon_m4a1" },
    { name: "AWP", id: "weapon_awp" },
    { name: "Desert Eagle", id: "weapon_deagle" },
    { name: "高爆手雷", id: "weapon_hegrenade" },
    { name: "闪光弹", id: "weapon_flashbang" },
    { name: "烟雾弹", id: "weapon_smokegrenade" },
    { name: "燃烧瓶", id: "weapon_molotov" },
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {weapons.map((weapon) => (
        <Button
          key={weapon.id}
          onClick={() => onGiveWeapon(weapon.id)}
          variant="outline"
          size="sm"
          disabled={!cheatsEnabled}
        >
          {weapon.name}
        </Button>
      ))}
    </div>
  )
}
