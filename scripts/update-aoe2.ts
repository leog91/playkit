import { mkdir, writeFile, rename } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import {
  fetchSourceRevision,
  importCivilizations,
  rosterKeys,
  type UniqueUnit,
  type SourceSnapshot,
} from '../src/features/games/age-of-empires-ii/source-data'

const revision = await fetchSourceRevision()
const base = `https://raw.githubusercontent.com/SiegeEngineers/aoe2techtree/${revision.commit}/`
async function download(path: string) {
  const response = await fetch(base + path, {
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok)
    throw new Error(
      `Download failed: ${path} (${response.status}). No snapshot installed.`,
    )
  return response
}
async function parallel<T, R>(
  items: T[],
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let index = 0
  await Promise.all(
    Array.from({ length: Math.min(6, items.length) }, async () => {
      while (index < items.length) {
        const current = index++
        results[current] = await task(items[current])
      }
    }),
  )
  return results
}

const [data, strings] = await Promise.all([
  download('data/data.json').then((r) => r.json()),
  download('data/locales/en/strings.json').then((r) => r.json()),
])
const keys = rosterKeys(data)
const trees = Object.fromEntries(
  await parallel(keys, async (key) => [
    key,
    await download(`data/trees/${key.toUpperCase()}.json`).then((r) =>
      r.json(),
    ),
  ]),
)
const snapshot: SourceSnapshot = {
  source: revision,
  civilizations: importCivilizations(data, strings, trees),
}
const artwork = new Map<string, string>()
function unitArtwork(unit: UniqueUnit) {
  artwork.set(`units/${unit.id}.png`, `img/Unit/${unit.picture}.png`)
  artwork.set(
    `buildings/${unit.building.id}.png`,
    `img/Building/${unit.building.picture}.png`,
  )
  unit.upgrades.forEach(unitArtwork)
}
for (const civ of snapshot.civilizations) {
  artwork.set(`civs/${civ.id}.png`, `img/Civs/${civ.id}.png`)
  civ.units.forEach(unitArtwork)
}
for (const resource of ['food', 'wood', 'gold', 'stone'])
  artwork.set(`resources/${resource}.png`, `img/${resource}.png`)
const images = await parallel([...artwork], async ([target, source]) => {
  const bytes = new Uint8Array(await (await download(source)).arrayBuffer())
  if (bytes[0] !== 137 || bytes[1] !== 80 || bytes[2] !== 78 || bytes[3] !== 71)
    throw new Error(`Invalid PNG: ${source}`)
  return { target, bytes }
})
// All downloads/schema checks finish before touching the installed snapshot.
for (const image of images) {
  const destination = new URL(`../public/aoe2/${image.target}`, import.meta.url)
  await mkdir(fileURLToPath(new URL('.', destination)), { recursive: true })
  await writeFile(destination, image.bytes)
}
await writeFile(
  new URL('../public/aoe2/manifest.json', import.meta.url),
  JSON.stringify(
    { source: revision, files: Object.fromEntries(artwork) },
    null,
    2,
  ) + '\n',
)
const destination = fileURLToPath(
  new URL(
    '../src/features/games/age-of-empires-ii/source-snapshot.json',
    import.meta.url,
  ),
)
await writeFile(`${destination}.tmp`, JSON.stringify(snapshot, null, 2) + '\n')
await rename(`${destination}.tmp`, destination)
console.log(
  `Imported the complete standard AoE II roster: ${snapshot.civilizations.length} civilizations and ${images.length} images.`,
)
console.log(
  `Source updated ${revision.updatedAt}; patch ${revision.patch ?? 'not specified'}.`,
)
console.log(
  'Review the generated files, run tests/build, then deploy. DLC access metadata is maintained separately.',
)
