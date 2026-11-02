// Armor-class names follow Siege Engineers' aoe2techtree/js/techtree.js.
// These are attack-table components, not calculated damage or a counter ranking.
const targets: Record<number, string> = {
  0: 'Wonders',
  1: 'Infantry',
  2: 'Heavy warships',
  5: 'Elephants',
  8: 'Mounted units (except camels)',
  11: 'All buildings',
  13: 'Stone defenses & harbors (except castles and kreposts)',
  14: 'Predator animals',
  15: 'Archers',
  16: 'Ships',
  17: 'High-pierce-armor siege units',
  18: 'Trees',
  19: 'Unique units',
  20: 'Siege units',
  21: 'Standard buildings (except wonders)',
  22: 'Walls & gates',
  23: 'Gunpowder units',
  24: 'Aggressive huntable animals',
  25: 'Monastery units',
  26: 'Castles & kreposts',
  27: 'Spearmen',
  28: 'Mounted archers',
  29: 'Shock infantry',
  30: 'Camels',
  32: 'Condottieri',
  34: 'Fishing ships',
  35: 'Mamelukes',
  36: 'Heroes & kings',
  37: 'Heavy siege',
  38: 'Skirmishers',
  40: 'Houses',
  41: 'Fire ships',
  60: 'Long-range warships',
}

export type AttackModifier = { classId: number; target: string; amount: number }
export type UnitCombat = {
  role: string | null
  bonuses: AttackModifier[]
  special: AttackModifier[]
}

export function importAttackModifiers(
  value: unknown,
): Omit<UnitCombat, 'role'> {
  if (!Array.isArray(value))
    throw new Error('Missing upstream unit attack table.')
  const bonuses: AttackModifier[] = []
  const special: AttackModifier[] = []
  for (const entry of value) {
    if (
      !entry ||
      typeof entry !== 'object' ||
      !Number.isInteger(entry.Class) ||
      entry.Class < 0 ||
      typeof entry.Amount !== 'number' ||
      !Number.isFinite(entry.Amount)
    ) {
      throw new Error('Invalid upstream unit attack component.')
    }
    // Base melee/pierce damage is already shown as Attack. Zero entries are not bonuses.
    if (entry.Amount === 0 || entry.Class === 3 || entry.Class === 4) continue
    const component = {
      classId: entry.Class,
      amount: entry.Amount,
      target: targets[entry.Class] ?? `Armor class ${entry.Class}`,
    }
    if (entry.Class === 31 || entry.Class === 39) {
      special.push({
        ...component,
        target:
          entry.Class === 31
            ? 'Armor-ignoring melee component (units, not buildings)'
            : 'Cavalry-resistance interaction',
      })
    } else {
      bonuses.push(component)
    }
  }
  return { bonuses, special }
}
