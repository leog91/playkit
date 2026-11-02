# AoE II artwork provenance

These locally served images are sourced from Siege Engineers' aoe2techtree.
`manifest.json` records the exact source revision and upstream path for every
image imported by `bun run update:aoe2` (all civilization crests, unique-unit
portraits including upgrades, training-building icons, and resource icons).

The original parchment texture and eight initial unit portraits were pinned
to revision `e56728e76b7d08301fba7b18d5f16bc8554c109a`:

https://github.com/SiegeEngineers/aoe2techtree/tree/e56728e76b7d08301fba7b18d5f16bc8554c109a/img

- `parchment.jpg`: `img/Backgrounds/bg_aoe2_hd_paper.jpg`
- `civs/*.png`: the corresponding `img/Civs/*.png`
- `resources/*.png`: `img/food.png`, `wood.png`, `gold.png`, `stone.png`
- `castle.png`: `img/Building/7.png`
- `units/8.png`: `img/Unit/41.png` (Longbowman)
- `units/281.png`: `img/Unit/46.png` (Throwing Axeman)
- `units/869.png`: `img/Unit/99.png` (Magyar Huszar)
- `units/291.png`: `img/Unit/44.png` (Samurai)
- `units/41.png`: `img/Unit/50.png` (Huskarl)
- `units/40.png`: `img/Unit/35.png` (Cataphract)
- `units/827.png`: `img/Unit/117.png` (War Wagon)
- `units/1016.png`: `img/Unit/195.png` (Shotel Warrior)

Our unit filenames are **unit IDs**, while upstream image filenames are
**picture indices**. The mapping was verified against each civilization's
`data/trees/*.json` at the pinned revision. Do not assume these IDs match.

Upstream artwork credit: Game Icons © Hidden Path Entertainment, Forgotten
Empires, SkyBox Labs, Ensemble Studios. Age of Empires II © Microsoft Corporation.
Microsoft-owned artwork is not relicensed by the repository's MIT code license.
See Microsoft's Game Content Usage Rules:
https://www.xbox.com/en-us/developers/rules

PlayKit is not endorsed by or affiliated with Microsoft or Siege Engineers.
The manual updater replaces roster artwork alongside the data snapshot. It
does not download images at runtime or replace the parchment background.
