import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useRef } from 'react'
import { Bookmark, Grid2X2, Menu, Settings2, Swords } from 'lucide-react'
import { visibleGames } from '@/features/games/catalog'
import { usePreferences } from '@/lib/preferences'

export function AppLayout() {
  const menu = useRef<HTMLDetailsElement>(null)
  const closeMenu = () => {
    if (menu.current) menu.current.open = false
  }
  const { preferences, storageError } = usePreferences()
  const isAoe = useRouterState({
    select: (state) =>
      state.location.pathname === '/games/age-of-empires-ii' ||
      state.location.pathname.startsWith('/games/age-of-empires-ii/'),
  })
  return (
    <div
      className={`app-shell without-sidebar ${preferences.compact ? 'compact' : ''}`}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <details
        className={`app-navigation${isAoe ? ' aoe-menu' : ''}`}
        ref={menu}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            closeMenu()
            menu.current?.querySelector('summary')?.focus()
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) closeMenu()
        }}
      >
        <summary>
          <Menu size={16} aria-hidden="true" />
          <span>Menu</span>
        </summary>
        <nav aria-label="Main navigation">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: 'active' }}
            onClick={closeMenu}
          >
            <Grid2X2 size={18} />
            Games
          </Link>
          <Link
            to="/saved"
            activeProps={{ className: 'active' }}
            onClick={closeMenu}
          >
            <Bookmark size={18} />
            Saved items
          </Link>
          {visibleGames.map((game) => (
            <Link
              key={game.id}
              to="/games/$gameId"
              params={{ gameId: game.id }}
              activeProps={{ className: 'active' }}
              onClick={closeMenu}
            >
              <Swords size={16} />
              <span>{game.name}</span>
            </Link>
          ))}
          <Link
            to="/settings"
            activeProps={{ className: 'active' }}
            onClick={closeMenu}
          >
            <Settings2 size={18} />
            Preferences
          </Link>
        </nav>
      </details>
      <div className={`main-column${isAoe ? ' aoe-theme' : ''}`}>
        <main id="main" tabIndex={-1}>
          {storageError && (
            <p className="storage-warning" role="status">
              Browser storage is unavailable. Changes will only last for this
              session.
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
