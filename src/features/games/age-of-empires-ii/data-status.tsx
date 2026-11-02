import { useCallback, useEffect, useRef, useState } from 'react'
import { Database, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import snapshot from './source-snapshot.json'
import {
  fetchSourceRevision,
  formatSourceDate,
  sourceRepository,
  type SourceRevision,
} from './source-data'

const cacheKey = `playkit:aoe2-source-check:v1:${snapshot.source.commit}`
type CheckResult = { checkedAt: string; latest: SourceRevision }

export function parseCachedCheck(
  raw: string | null,
  now = Date.now(),
): CheckResult | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw)
    if (
      !value ||
      typeof value.checkedAt !== 'string' ||
      !Number.isFinite(Date.parse(value.checkedAt)) ||
      Date.parse(value.checkedAt) > now ||
      !value.latest ||
      typeof value.latest.commit !== 'string' ||
      !/^[a-f0-9]{40}$/.test(value.latest.commit) ||
      typeof value.latest.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(value.latest.updatedAt)) ||
      !(
        value.latest.patch === null ||
        (typeof value.latest.patch === 'string' &&
          /^\d+$/.test(value.latest.patch))
      )
    )
      return null
    return {
      checkedAt: value.checkedAt,
      latest: {
        commit: value.latest.commit,
        updatedAt: value.latest.updatedAt,
        patch: value.latest.patch,
      },
    }
  } catch {
    return null
  }
}

export function DataStatus() {
  const [result, setResult] = useState<CheckResult | null>(null)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(false)
  const inFlight = useRef(false)

  const check = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    setChecking(true)
    setError(null)
    try {
      const latest = await fetchSourceRevision()
      const next = { checkedAt: new Date().toISOString(), latest }
      if (!mounted.current) return
      setResult(next)
      try {
        localStorage.setItem(cacheKey, JSON.stringify(next))
      } catch {
        /* Optional cache; update checks also work without browser storage. */
      }
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error && cause.name !== 'TimeoutError'
            ? cause.message
            : 'The update check timed out. Please try again.',
        )
    } finally {
      inFlight.current = false
      if (mounted.current) setChecking(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    let cached: CheckResult | null = null
    try {
      cached = parseCachedCheck(localStorage.getItem(cacheKey))
    } catch {
      /* Storage may be blocked. */
    }
    if (cached) setResult(cached)
    // Cached results are history, not proof that the source is still current.
    void check()
    return () => {
      mounted.current = false
    }
  }, [check])

  const changed = result && result.latest.commit !== snapshot.source.commit
  const newer =
    changed &&
    Date.parse(result.latest.updatedAt) > Date.parse(snapshot.source.updatedAt)
  const status = checking
    ? 'Checking…'
    : error
      ? 'Couldn’t check'
      : changed
        ? newer
          ? 'Update available'
          : 'Source data changed'
        : result
          ? 'Up to date'
          : 'Not checked'
  const statusKind = checking
    ? 'checking'
    : error
      ? 'error'
      : changed
        ? 'outdated'
        : 'current'

  return (
    <section className="data-status" aria-label="AoE II data version">
      <div className="data-status-heading">
        <Database size={19} aria-hidden="true" />
        <div>
          <h2>
            Game data updated{' '}
            <time dateTime={snapshot.source.updatedAt}>
              {formatSourceDate(snapshot.source.updatedAt)}
            </time>
          </h2>
          <p>
            AoE II DE ·{' '}
            {snapshot.source.patch
              ? `Patch ${snapshot.source.patch}`
              : 'Patch not specified'}{' '}
            · Local snapshot
          </p>
          <span
            className="data-state-label"
            data-state={statusKind}
            role="status"
            aria-live="polite"
          >
            {status}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void check()}
          disabled={checking}
        >
          <RefreshCw size={13} aria-hidden="true" />
          {checking ? 'Checking…' : 'Check again'}
        </Button>
      </div>
      {changed && !checking && !error && (
        <div className="data-status-message">
          <p className="data-update-available">
            <strong>
              {newer
                ? 'New upstream data available'
                : 'Upstream revision differs'}{' '}
              — {formatSourceDate(result.latest.updatedAt)}.
            </strong>{' '}
            {result.latest.patch && <span>Patch {result.latest.patch}. </span>}
            {newer
              ? 'PlayKit is using older data from '
              : 'PlayKit uses data from '}
            {formatSourceDate(snapshot.source.updatedAt)}. Updates are reviewed
            and installed manually.
          </p>
        </div>
      )}
      {error && (
        <p className="data-check-error" role="alert">
          Update check failed: {error} Local data is unchanged.
        </p>
      )}
      <details className="data-status-details">
        <summary>Update details</summary>
        {result ? (
          <p>
            Last successful check:{' '}
            <time dateTime={result.checkedAt}>
              {formatSourceDate(result.checkedAt)}
            </time>
            .
          </p>
        ) : (
          <p>No successful update check yet.</p>
        )}
        {error && result && (
          <p>
            The previous result is saved, but the source’s current status could
            not be verified.
          </p>
        )}
        <p>
          Source-data update date, not the patch release date. DLC access is
          checked separately. Checks never replace the local snapshot.
        </p>
        {changed && (
          <p>
            Manual update: <code>bun run update:aoe2</code>, then review and
            deploy.
          </p>
        )}
        <div className="data-status-footnote">
          <a href={sourceRepository} target="_blank" rel="noreferrer">
            Siege Engineers / aoe2techtree <ExternalLink size={11} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </details>
    </section>
  )
}
