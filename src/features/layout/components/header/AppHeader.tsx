import { ChevronDown, LogOut, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations'
import { routes } from '@/shared/config/routes'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { Button } from '@/shared/ui/Button'
import { LogoIcon } from '@/shared/ui/LogoIcon'
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

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur h-16">
      <div
        className={`mx-auto flex ${containerWidthClass} h-full items-center justify-between gap-6 px-6`}
      >
        <Link
          to={routes.home}
          className="focus-visible:outline-hidden group flex items-center leading-tight focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Dupilot 홈으로 이동"
        >
          <LogoIcon />
          <span className="text-2xl font-bold tracking-tight text-on-primary-container">
            Dupilot
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-start px-10 h-full">
          <nav className="flex items-center gap-8 h-full">
            <Link
              to={routes.workspace}
              className={[
                'flex h-full items-center border-b-2 px-1 text-sm font-medium transition-colors font-semibold',
                /^\/workspace/.test(location.pathname)
                  ? 'border-[hsl(var(--on-primary-container))] text-on-primary-container'
                  : 'border-transparent text-muted-foreground hover:text-on-primary-container font-semibold',
              ].join(' ')}
            >
              더빙
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={() => navigate(`${routes.voiceLibrary}?tab=library`)}
                  className={[
                    'flex h-full items-center border-b-2 px-1 text-sm font-medium transition-colors font-semibold',
                    /^\/voice-library/.test(location.pathname)
                      ? 'border-[hsl(var(--on-primary-container))] text-on-primary-container'
                      : 'border-transparent text-muted-foreground hover:text-on-primary-container font-semibold',
                  ].join(' ')}
                >
                  보이스 마켓
                  <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-40 rounded-2xl border border-outline/40 bg-surface-1 p-1 shadow-soft"
              >
                <DropdownMenuItem onSelect={() => navigate(`${routes.voiceLibrary}?tab=library`)}>
                  탐색
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate(`${routes.voiceLibrary}?tab=mine`)}>
                  내 목소리
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated && <NotificationDropdown />}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-sm font-semibold uppercase text-foreground shadow-inner"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    Creator
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {userName ?? '미등록'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleMyInfo}>
                  <User className="h-4 w-4 text-muted-foreground" />내 정보
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onSelect={handleSignOut}>
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
                className="text-muted-foreground hover:text-foreground font-semibold"
              >
                <Link to={routes.login}>로그인</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground font-semibold"
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
