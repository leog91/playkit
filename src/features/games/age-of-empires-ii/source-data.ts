export const sourceRepository = 'https://github.com/SiegeEngineers/aoe2techtree'
export const sourceCommitsUrl =
  'https://api.github.com/repos/SiegeEngineers/aoe2techtree/commits?path=data&per_page=1'

export type SourceRevision = {
  commit: string
  updatedAt: string
  patch: string | null
}

export type UnitStats = {
  id: number
  hp: number
  attack: number
  range: number
  cost: Partial<Record<'Food' | 'Wood' | 'Gold' | 'Stone', number>>
}
export const playstyles = [
  'Archers',
  'Cavalry',
  'Infantry',
  'Defensive',
  'Naval',
  'Siege',
  'Gunpowder',
  'Monks',
] as const
export type Playstyle = (typeof playstyles)[number]
export type AttackStyle = 'All' | 'Melee' | 'Ranged'
export type UniqueUnit = UnitStats & {
  name: string
  picture: number
  building: { id: number; name: string; picture: number }
  age: string
  combat: UnitCombat
  upgrades: UniqueUnit[]
}
export type Civilization = {
  id: string
  name: string
  focusText: string
  focuses: Playstyle[]
  bonuses: string[]
  uniqueTechs: string[]
  teamBonus: string
  regionalFeatures: string[]
  units: UniqueUnit[]
}
export type SourceSnapshot = {
  source: SourceRevision
  civilizations: Civilization[]
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Unexpected upstream data format.')
  }
  return value as Record<string, unknown>
}

export function parseRevision(value: unknown): SourceRevision {
  if (!Array.isArray(value) || !value.length) {
    throw new Error('No upstream data revision was returned.')
  }
  const entry = object(value[0])
  const commit = object(entry.commit)
  const committer = object(commit.committer)
  if (
    typeof entry.sha !== 'string' ||
    !/^[a-f0-9]{40}$/.test(entry.sha) ||
    typeof committer.date !== 'string' ||
    !Number.isFinite(Date.parse(committer.date)) ||
    typeof commit.message !== 'string'
  )
    throw new Error('Unexpected upstream revision format.')
  return {
    commit: entry.sha,
    updatedAt: new Date(committer.date).toISOString(),
    patch: /\bDE Update\s+(\d+)\b/i.exec(commit.message)?.[1] ?? null,
  }
}

export async function fetchSourceRevision(): Promise<SourceRevision> {
  const response = await fetch(sourceCommitsUrl, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
  })
  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error(
        'The source is limiting update checks. Please try again later.',
      )
    }
    throw new Error('Could not reach the data source. Please try again later.')
  }
  return parseRevision(await response.json())
}

function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(
      'Unexpected upstream unit stat. The local dataset was not changed.',
    )
  }
  return value
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error('Missing upstream text.')
  return value.trim()
}

// Convert trusted source formatting to plain text; never render upstream HTML.
export function descriptionLines(value: unknown): string[] {
  return text(value)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split('\n')
    .map((line) => line.replace(/^[•\s]+/, '').trim())
    .filter(Boolean)
}

export function classifyFocus(value: string): Playstyle[] {
  const terms: [Playstyle, RegExp][] = [
    ['Archers', /archer/i],
    ['Cavalry', /cavalry|camel|elephant/i],
    ['Infantry', /infantry/i],
    ['Defensive', /defens/i],
    ['Naval', /naval/i],
    ['Siege', /siege/i],
    ['Gunpowder', /gunpowder/i],
    ['Monks', /monk/i],
  ]
  return terms
    .filter(([, pattern]) => pattern.test(value))
    .map(([style]) => style)
}

function displayText(value: unknown): string {
  return descriptionLines(value).join(' ').replace(/\s+/g, ' ')
}

export function importUnitRole(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  // The in-game help starts with a creation/cost heading; upgrades and stat
  // placeholders follow the role description. Keep only that description.
  const description = value.split(/<i\b/i)[0].replace(/‹[^›]*›/g, '')
  const lines = descriptionLines(description)
  if (/^(Create|Train|Upgrade|Build)\b/i.test(lines[0] ?? '')) lines.shift()
  return lines.join(' ').trim() || null
}

export function rosterKeys(value: unknown): string[] {
  return Object.entries(object(object(value).civs))
    .filter(([, civ]) => object(civ).era === 'base')
    .map(([key]) => key)
    .sort()
}

export function importCivilizations(
  value: unknown,
  localeValue: unknown,
  trees: Record<string, unknown>,
): Civilization[] {
  const root = object(value)
  const civs = object(root.civs)
  const units = object(object(root.data).Unit)
  const strings = object(localeValue)
  const keys = rosterKeys(value)
  if (!keys.length) throw new Error('The source roster is empty.')
  return keys.map((key) => {
    const civ = object(civs[key])
    const tree = object(trees[key])
    if (!Array.isArray(tree.units_techs) || !Array.isArray(tree.buildings))
      throw new Error(`Missing tree: ${key}`)
    const nodes = tree.units_techs.map(object)
    const buildings = tree.buildings.map(object)
    const lines = descriptionLines(strings[String(civ.help_string_id)])
    const uniqueStart = lines.findIndex((line) => /^Unique Units?:/i.test(line))
    const techStart = lines.findIndex((line) => /^Unique Techs?:/i.test(line))
    const teamStart = lines.findIndex((line) => /^Team Bonus:/i.test(line))
    if (uniqueStart < 1 || techStart < uniqueStart || teamStart < techStart)
      throw new Error(`Unrecognized civilization description: ${key}`)
    const available = nodes.filter(
      (node) => node.node_status !== 'NotAvailable',
    )
    const uniqueNodes = available.filter(
      (node) => node.use_type === 'Unit' && node.node_type === 'UniqueUnit',
    )
    const imported = new Map<number, UniqueUnit>()
    for (const node of uniqueNodes) {
      const id = number(node.node_id)
      if (imported.has(id)) continue
      const unit = object(units[id])
      if (unit.ID !== id) throw new Error(`Missing unit ${id} for ${key}.`)
      const building = buildings.find(
        (entry) => entry.node_id === node.building_id,
      )
      if (!building)
        throw new Error(`Missing training building for ${key}/${id}.`)
      const cost = object(unit.Cost)
      const age = ['Dark Age', 'Feudal Age', 'Castle Age', 'Imperial Age'][
        number(node.age_id) - 1
      ]
      if (!age) throw new Error(`Invalid age for ${key}/${id}.`)
      imported.set(id, {
        id,
        name: displayText(node.name ?? strings[String(node.name_string_id)]),
        hp: number(unit.HP),
        attack: number(unit.Attack),
        range: number(unit.Range),
        combat: {
          role: importUnitRole(
            strings[String(Number(node.help_string_id) - 79000)],
          ),
          ...importAttackModifiers(unit.Attacks),
        },
        cost: Object.fromEntries(
          Object.entries(cost).map(([resource, amount]) => {
            if (!['Food', 'Wood', 'Gold', 'Stone'].includes(resource))
              throw new Error(`Unknown resource: ${resource}`)
            return [resource, number(amount)]
          }),
        ),
        picture: number(node.picture_index),
        age,
        building: {
          id: number(building.node_id),
          name: displayText(
            building.name ?? strings[String(building.name_string_id)],
          ),
          picture: number(building.picture_index),
        },
        upgrades: [],
      })
    }
    const upgrades = new Set<number>()
    for (const node of uniqueNodes) {
      const unit = imported.get(Number(node.node_id))!
      const parent = imported.get(Number(node.link_id))
      if (parent && parent.id !== unit.id) {
        if (!parent.upgrades.some((upgrade) => upgrade.id === unit.id))
          parent.upgrades.push(unit)
        upgrades.add(unit.id)
      }
    }
    const unitLines = [...imported.values()]
      .filter((unit) => !upgrades.has(unit.id))
      .sort(
        (a, b) =>
          Number(b.building.id === 82) - Number(a.building.id === 82) ||
          a.id - b.id,
      )
    if (!unitLines.length)
      throw new Error(`No unique units imported for ${key}.`)
    return {
      id: key.toLowerCase(),
      name: displayText(strings[String(civ.name_string_id)] ?? key),
      focusText: lines[0],
      focuses: classifyFocus(lines[0]),
      bonuses: lines.slice(1, uniqueStart),
      uniqueTechs: lines.slice(techStart + 1, teamStart),
      teamBonus: lines.slice(teamStart + 1).join(' '),
      regionalFeatures: [
        ...new Set(
          available
            .filter((node) =>
              ['RegionalUnit', 'RegionalTech'].includes(String(node.node_type)),
            )
            .map((node) =>
              displayText(node.name ?? strings[String(node.name_string_id)]),
            )
            .filter((name) => !/^Elite /i.test(name)),
        ),
      ],
      units: unitLines,
    }
  })
}

export function formatSourceDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(value))
}
import { importAttackModifiers, type UnitCombat } from './unit-combat'
