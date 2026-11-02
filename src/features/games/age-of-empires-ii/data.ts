import snapshot from './source-snapshot.json'
import { classifyFocus, type Civilization } from './source-data'

export type { Civilization, Playstyle, AttackStyle } from './source-data'
export { playstyles } from './source-data'

// Generated from the entire standard AoE II roster at the recorded revision.
export const civilizations: Civilization[] = snapshot.civilizations.map(
  (civ) => ({
    ...civ,
    focuses: classifyFocus(civ.focusText),
  }),
)
