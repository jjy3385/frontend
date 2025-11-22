import { Outlet, ScrollRestoration } from 'react-router-dom'

import { AppFooter } from '../../features/layout/components/footer/AppFooter'
import { AppHeader } from '../../features/layout/components/header/AppHeader'
import { ProjectCreationModal } from '../../features/projects/modals/ProjectCreationModal'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-1 text-foreground">
      <AppHeader />
      <div className="flex flex-1">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <ProjectCreationModal />
      <AppFooter />
      <ScrollRestoration />
    </div>
  )
}
