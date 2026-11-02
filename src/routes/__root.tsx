import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { AppLayout } from '@/components/app-layout'
import { PreferencesProvider } from '@/lib/preferences'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'PlayKit',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: () => (
    <PreferencesProvider>
      <AppLayout />
    </PreferencesProvider>
  ),
  notFoundComponent: () => (
    <section className="empty-state">
      <h1>Page not found</h1>
      <p>The requested page does not exist.</p>
      <Link to="/">Back to games →</Link>
    </section>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
