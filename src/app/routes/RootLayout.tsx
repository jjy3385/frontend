import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'

import { AppFooter } from '../../features/layout/components/footer/AppFooter'
import { AppHeader } from '../../features/layout/components/header/AppHeader'
import { AppSidebar } from '../../features/layout/components/sidebar/AppSidebar'
import { ProjectCreationModal } from '../../features/projects/modals/ProjectCreationModal'
import { useAuthStore } from '../../shared/store/useAuthStore'

export function RootLayout() {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hideSidebar = location.pathname.startsWith('/editor') || !isAuthenticated

  return (
    <div className="flex min-h-screen flex-col bg-surface-1 text-foreground">
      <AppHeader />
      <div className="flex flex-1">
        {!hideSidebar && <AppSidebar />}
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
