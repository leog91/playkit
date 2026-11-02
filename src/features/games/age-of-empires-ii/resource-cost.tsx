import type { UnitStats } from './source-data'

const resources = ['Food', 'Wood', 'Gold', 'Stone'] as const

export function ResourceCost({ cost }: { cost: UnitStats['cost'] }) {
  return (
    <ul className="resource-cost" aria-label="Unit resource cost">
      {resources.map((resource) => {
        const amount = cost[resource]
        if (!amount) return null
        return (
          <li key={resource} title={`${amount} ${resource.toLowerCase()}`}>
            <img
              src={`/aoe2/resources/${resource.toLowerCase()}.png`}
              alt=""
              width={22}
              height={22}
              loading="lazy"
            />
            <span>
              {amount}
              <span className="sr-only"> {resource.toLowerCase()}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
