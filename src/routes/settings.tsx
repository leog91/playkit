import { createFileRoute } from '@tanstack/react-router'
import { HardDrive, PanelTop } from 'lucide-react'
import { PageHeading } from '@/components/page-heading'
import { usePreferences } from '@/lib/preferences'

export const Route = createFileRoute('/settings')({ component: Settings })
function Settings() {
  const { preferences, setCompact, ready } = usePreferences()
  return (
    <>
      <PageHeading title="Preferences" />
      <section className="panel settings-panel">
        <div className="setting-row">
          <PanelTop size={22} />
          <div>
            <h2>Compact display</h2>
            <p>Reduce card spacing.</p>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={preferences.compact}
              disabled={!ready}
              onChange={(event) => setCompact(event.target.checked)}
            />
            <span>Enabled</span>
          </label>
        </div>
        <div className="setting-row">
          <HardDrive size={22} />
          <div>
            <h2>Browser storage</h2>
            <p>
              Your favorites and preferences stay in this browser. They don’t
              sync between devices and are removed if you clear site data.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
