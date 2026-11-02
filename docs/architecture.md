# PlayKit MVP

## UI conventions

PlayKit is a personal utility, not a product landing page. Use direct page and
action names, compact navigation, and working tools. Do not add promotional
heroes, slogans, decorative status badges, fake avatars, dashboard statistics,
or roadmap/coming-soon panels. List resources without advertising unbuilt
features. Keep the AoE II parchment theme; describe data limitations briefly
and factually rather than with marketing copy.

There is no persistent sidebar. A closed-by-default Menu in the top-right
provides navigation without reserving a column. It closes after navigation,
when focus leaves it, or on Escape. Pages use the full available width.

## Run and verify

```sh
bun install
bun run dev
bun run typecheck
bun test
bun run build
```

The existing Cloudflare/TanStack Start deployment setup is retained. No authentication, database, or backend API is introduced. Picker results use bundled local data; optional browser update checks contact GitHub's public API.

## Routes

| Route                             | Purpose                                                  |
| --------------------------------- | -------------------------------------------------------- |
| `/`                               | Dashboard and game directory                             |
| `/games/$gameId`                  | Shared game overview, available tool, external resources |
| `/games/age-of-empires-ii/picker` | Full roster, focus/attack/expansion filters, random pick |
| `/saved`                          | Saved civilizations with removal controls                |
| `/settings`                       | Persistent compact-display preference                    |

TanStack generates `src/routeTree.gen.ts`; do not edit it manually. Unknown game IDs return a not-found page.

## Boundaries

- `src/features/games/catalog.ts`: presentation metadata and resource links only. Battlefield currently has no game logic or invented weapon data.
- `src/features/games/age-of-empires-ii/`: generated roster snapshot, pure importer/filtering logic, separately reviewed expansion/access metadata, tests, and civilization presentation. Future game tools should live in their own game directory rather than extending a universal game engine.
- `src/components/`: application shell, game cards, headings, reusable search/filter controls, and a small shadcn-style button foundation. `components.json` configures future shadcn additions; no component framework runtime is required for the native button.
- `src/lib/preferences.tsx`: shared local state for this iteration. Reads storage after hydration, validates saved IDs, deduplicates them, and writes only after the initial read. Unavailable storage falls back to session memory with a visible warning.
- `src/styles.css`: Tailwind 4 tokens, dark workspace styling, responsive layout, compact spacing, reduced-motion and keyboard-focus support.

## Deliberate limits

The picker uses the entire standard AoE II roster from the imported revision (56 civilizations in Update 188329). Chronicles and Return of Rome's separate AoE I roster are not merged into it; Romans, the AoE II civilization from Return of Rome, are included. Filters are not competitive tier rankings. Current focus tags are derived from upstream civilization descriptions; melee/ranged filters inspect unique-unit attack range, not damage type. No fabricated beginner ratings or curated eight-civilization subset remains.

Favorites and compact mode use `playkit:preferences:v1` in localStorage. Data does not sync between devices. No analytics, account, or backend persistence is involved. New saved-item types can introduce namespaced IDs when needed; no speculative generalized bookmark system is built yet.

## Verification

Unit tests cover filter composition, search normalization, empty results, and unique dataset IDs. Browser smoke checks cover navigation, random selection, saving and reloading, compact-mode persistence, empty results, unknown-game 404s, and mobile horizontal overflow.

## Next small increments

1. Extend civilization comparison tools when needed.
2. Add one independently typed Battlefield loadout dataset and an attachment viewer.
3. Extend saved items to loadouts only when that tool exists.

Civilization comparisons, personalization, and additional games remain outside this first iteration.

## AoE II data freshness and manual updates

The picker displays **Game data updated [date]**, with the source patch number underneath. This is the upstream dataset's commit date, not a download timestamp or a claim about the game patch release date. All civilizations and their unique units are imported, including non-Castle units, alternative training locations, and elite upgrades. Preview stats are base values for the displayed unit variant; civilization bonuses and researched technologies are not applied. Bonuses, unique technologies, and team bonuses are imported as plain text from the matching English strings, not rendered as upstream HTML.

`source-snapshot.json` bundles those unit stats with the exact upstream commit, date, and patch (if explicitly stated in the source commit message). The source is Siege Engineers' `aoe2techtree`, with attribution and license in `THIRD_PARTY_NOTICES.md`.

On every entry to the picker, the browser requests the latest commit affecting `data/` from GitHub's public commits API. This includes tree and locale changes, not only unit-stat changes. The compact panel explicitly shows Checking, Up to date, Update available, or Couldn't check; a differing revision without a newer timestamp is labeled Source data changed. Successful results are stored as history keyed by the installed revision, but never skip the next page-entry check or prove freshness while a new check is pending. **Check again** retries manually. Checks compare revisions, not guessed patch numbers. Rate limits/offline errors do not claim that data is current, do not overwrite the last successful check, and never replace local game data. Source details and timestamps are expandable.

There are no GitHub Actions, scheduler, server credentials, or runtime dataset replacements. To import intentionally:

```sh
bun run update:aoe2
bun test
bun run typecheck
bun run build
```

The command fetches the latest data revision and downloads `data/data.json`, English strings, and every standard civilization's tree pinned to that commit. It validates the complete roster and downloads corresponding artwork with bounded concurrency. Downloads and validation finish before replacing the snapshot; image provenance is generated in `public/aoe2/manifest.json`. Review the file changes before deploying; visitors cannot update the deployed snapshot. Upstream schema changes fail the import rather than silently accepting incorrect fields. Dates/version metadata update along with actual imported data and images.

Expansion origin and current purchase requirements are reviewed separately in `expansions.ts`, with sources and a verification date. All 56 current civilizations have an entry. Older original expansions are included in DE; Lords of the West, Dawn of the Dukes, and Dynasties of India are included with current PC DE purchases (older licenses may differ). Paid DLC labels describe a requirement, not knowledge of the user's purchases. Hindustanis preserve their Forgotten/Indians origin with a Dynasties of India rework note.

Shared regional units and technologies come from each civilization's available tree nodes. Confirmed pack-wide shared features for The Last Chieftains and The Viking Sagas are separately sourced. Owning a pack is not presented as granting a team bonus. New upstream civilizations are still imported if commercial metadata is missing; their access is explicitly marked unverified until reviewed.

The AoE Resources links include AoE2 Recs, AoE2 Insights, the wiki, tech tree, build-order guides, official updates, and Liquipedia. They are outbound links only: PlayKit does not fetch ranks, player profiles, or match histories.

## Unit roles and bonus damage

Every unique-unit variant, including elite upgrades, imports its English in-game role description and raw attack-class modifiers. The help-string lookup uses the same `help_string_id - 79000` offset as aoe2techtree. Formatting is converted to plain text; creation headings, upgrade instructions, and stat placeholders are removed. This captures special effects such as armor-ignoring arrows that cannot be inferred from damage numbers alone.

`unit-combat.ts` labels target armor classes using aoe2techtree's class definitions. Base pierce/melee components (3/4) and zero entries are excluded from the bonus list. Nonzero modifiers remain signed; special armor-ignoring and cavalry-resistance components (31/39) are shown separately rather than mislabeled as ordinary target bonuses. Unknown future classes retain their numeric ID, not an invented target name.

These are source-described roles and base attack components, not guaranteed counter matchups or a final damage calculator. Targets can have overlapping classes and bonus armor; researched technologies and civilization effects can change outcomes. The normal manual import refreshes this information along with the rest of the roster.

## AoE II visual theme

`theme.css` in the AoE II feature supplies a scoped parchment-and-bronze skin on
the game overview and picker. `AppLayout` derives `.aoe-theme` from the current
router pathname, including during SSR; no global theme mutation is needed.
Other games and the shared navigation retain PlayKit's dark workspace theme.

The picker uses civilization crests, blue unique-unit tiles, Castle/age labels,
and accessible resource-cost icons (food, wood, gold, stone). Artwork is served
locally from `public/aoe2`, not hotlinked. Image provenance and the distinction
between unit IDs and upstream picture indices are documented in
`public/aoe2/README.md`. The Saved page reuses the same portraits and cost
component within its existing dark theme. The design remains a responsive
chooser, not a full tech-tree renderer.
