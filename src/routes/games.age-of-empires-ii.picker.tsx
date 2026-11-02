import { createFileRoute } from '@tanstack/react-router'
import { CivilizationPicker } from '@/features/games/age-of-empires-ii/picker'

export const Route = createFileRoute('/games/age-of-empires-ii/picker')({
  component: CivilizationPicker,
})
