import { Waves, Clapperboard, LogOut, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations'
import { routes } from '@/shared/config/routes'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { Button } from '@/shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'

import { NotificationDropdown } from './NotificationDropdown'

export function AppHeader() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userName = useAuthStore((state) => state.userName)
  const location = useLocation()
  const navigate = useNavigate()
  const logoutMutation = useLogoutMutation()
  const containerWidthClass = 'w-full max-w-7xl'
  const initials =
    userName
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'DP'

  const handleMyInfo = () => {
    navigate(routes.myinfo)
  }

  const handleSignOut = () => {
    logoutMutation.mutate()
  }

  const navItems = [
    {
      label: '더빙',
      to: routes.workspace,
      isActive: /^\/workspace/.test(location.pathname),
      icon: Clapperboard,
    },
    {
      label: '보이스 마켓',
      to: routes.voiceLibrary,
      isActive: /^\/voice-library/.test(location.pathname),
      icon: Waves,
    },
  ]
  // const userNavItems = isAuthenticated
  //   ? [
  //       { to: `${routes.home}projects`, label: '에피소드' },
  //       { to: `${routes.home}voice-samples`, label: '보이스 샘플' },
  //       { to: `${routes.home}guide`, label: '이용 가이드' },
  //       { to: `${routes.home}support`, label: '문의' },
  //     ]
  //   : []

  return (
    <header className="sticky top-0 z-40 border-b border-surface-3 bg-[#F3F4F6]/90 backdrop-blur">
      <div
        className={`mx-auto flex ${containerWidthClass} items-center justify-between gap-6 px-6 py-2`}
      >
        <Link
          to={routes.home}
          className="focus-visible:outline-hidden group flex flex-col leading-tight focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Dupliot 홈으로 이동"
        >
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            Dupliot
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-start px-10">
          <nav className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    'flex items-center gap-2 text-sm font-semibold transition-colors',
                    item.isActive ? 'text-primary' : 'text-muted hover:text-foreground',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated && <NotificationDropdown />}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-surface-4 bg-surface-2 text-sm font-semibold uppercase text-foreground shadow-inner"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted">
                    Creator
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {userName ?? '미등록'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleMyInfo}>
                  <User className="h-4 w-4 text-muted" />내 정보
                </DropdownMenuItem>
                <DropdownMenuItem className="text-danger" onSelect={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-md px-4 text-foreground/70 hover:bg-surface-2/80 hover:text-foreground"
              >
                <Link to={routes.login}>로그인</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-md border border-surface-3 bg-surface-1 px-5 font-semibold text-foreground shadow-soft hover:bg-white"
              >
                <Link to={routes.signup}>회원가입</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
