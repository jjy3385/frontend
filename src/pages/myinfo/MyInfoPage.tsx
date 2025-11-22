import { useCallback, useEffect, useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  CalendarDays,
  KeyRound,
  Mail,
  PenSquare,
  Shield,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getCurrentUser, type UserOut } from '@/features/auth/api/authApi'
import { YoutubeIntegrationCard } from '@/features/youtube/components/YoutubeIntegrationCard'
import { CreditTopupModal } from '@/features/credits/components/CreditTopupModal'
import { useCreditBalance, useCreditPackages, usePurchaseCredits } from '@/features/credits/hooks/useCredits'
import type { CreditPackage } from '@/features/credits/api/creditsApi'
import { routes } from '@/shared/config/routes'
import { CREDIT_COST_PER_VOICE_ADD } from '@/shared/constants/credits'
import { Badge } from '@/shared/ui/Badge'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useUiStore } from '@/shared/store/useUiStore'
import { Button } from '@/shared/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'

const fallbackUser: UserOut = {
  username: '게스트',
  email: 'unknown@example.com',
  role: 'guest',
  createdAt: new Date(),
  google_sub: '',
}

export default function MyInfoPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { showToast } = useUiStore()
  const navigate = useNavigate()
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false)
  const { data: creditBalanceData, isLoading: creditLoading, refetch: refetchCreditBalance } = useCreditBalance()
  const { data: creditPackagesData } = useCreditPackages()
  const purchaseCreditsMutation = usePurchaseCredits()

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const profile = data ?? fallbackUser
  const isGoogleAccount = Boolean(profile.google_sub)
  const creditBalance = creditBalanceData?.balance ?? 0
  const fallbackPackages: CreditPackage[] = useMemo(
    () => [
      { id: 'pack-starter', label: '스타터 1,000', credits: 1000, priceKRW: 9900 },
      { id: 'pack-pro', label: '프로 5,000', credits: 5000, priceKRW: 44900, bonusCredits: 250 },
      { id: 'pack-team', label: '팀 10,000', credits: 10000, priceKRW: 84900, bonusCredits: 1000 },
      { id: 'pack-elite', label: '엘리트 20,000', credits: 20000, priceKRW: 159900, bonusCredits: 2500 },
    ],
    [],
  )
  const creditPackages = creditPackagesData ?? fallbackPackages
  const isPurchasingCredits = purchaseCreditsMutation.status === 'pending'

  const formattedJoinDate = useMemo(() => {
    if (!profile.createdAt) return '-'
    const date = new Date(profile.createdAt)
    if (Number.isNaN(date.getTime())) return '-'
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [profile.createdAt])

  const initials = useMemo(() => {
    return (
      profile.username
        ?.split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'ME'
    )
  }, [profile.username])

  const accountDetails = useMemo(
    () => [
      {
        label: '이메일',
        value: profile.email,
        icon: Mail,
      },
      {
        label: '역할',
        value: profile.role ? profile.role.toUpperCase() : '-',
        icon: Shield,
      },
      {
        label: '가입일',
        value: formattedJoinDate,
        icon: CalendarDays,
      },
    ],
    [profile.email, profile.role, formattedJoinDate],
  )

  const handlePurchasePackage = useCallback(
    (pkg: CreditPackage) => {
      purchaseCreditsMutation.mutate(
        { packageId: pkg.id },
        {
          onSuccess: () => {
            showToast({ title: '크레딧이 충전되었습니다.', variant: 'success' })
            setIsCreditModalOpen(false)
            void refetchCreditBalance()
          },
          onError: (error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : typeof error === 'string'
                  ? error
                  : '충전에 실패했습니다.'
            showToast({ title: '충전 실패', description: message, variant: 'error' })
          },
        },
      )
    },
    [purchaseCreditsMutation, refetchCreditBalance, showToast],
  )

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.35em]">Account</p>
          <p className="text-muted mt-1 text-sm">
            계정 정보를 확인하고 알림, 보안 설정을 관리할 수 있습니다.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="border-surface-3 bg-surface-1 flex items-center justify-center rounded-3xl border py-20">
          <Spinner size="lg" />
          <span className="text-muted ml-3 text-sm">사용자 정보를 불러오는 중…</span>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary flex h-24 w-24 items-center justify-center rounded-3xl text-3xl font-bold">
                  {initials}
                </div>
                <div className="space-y-2">
                  <p className="text-muted text-xs font-semibold uppercase tracking-[0.35em]">
                    Profile
                  </p>
                  <h2 className="text-foreground text-2xl font-semibold">{profile.username}</h2>
                  <Badge tone="default" className="text-xs uppercase tracking-wide">
                    {profile.role || 'unassigned'}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2">
                  <PenSquare className="h-4 w-4" />
                  프로필 편집
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => navigate(routes.changePassword)}
                  disabled={isGoogleAccount}
                  title={
                    isGoogleAccount ? '구글 로그인 계정은 비밀번호를 변경할 수 없습니다.' : undefined
                  }
                >
                  <KeyRound className="h-4 w-4" />
                  비밀번호 변경
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {accountDetails.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="border-surface-3 bg-surface-1 flex items-start gap-3 rounded-2xl border p-4"
                >
                  <div className="text-muted flex h-10 w-10 items-center justify-center rounded-2xl bg-white/50">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted text-xs uppercase tracking-wide">{label}</p>
                    <p className="text-foreground text-sm font-medium">{value ?? '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <CardHeader>
              <CardTitle>크레딧</CardTitle>
              <CardDescription>보유 크레딧을 확인하고 충전하세요.</CardDescription>
            </CardHeader>
            <div className="flex flex-col gap-3 px-6 pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs text-muted">보유 크레딧</p>
                <p className="text-2xl font-semibold text-foreground">
                  {creditLoading ? '불러오는 중...' : `${creditBalance.toLocaleString()} 크레딧`}
                </p>
                <p className="text-xs text-muted">
                  내 목소리 추가 1회당 {CREDIT_COST_PER_VOICE_ADD.toLocaleString()} 크레딧 차감
                </p>
              </div>
              <Button
                className="gap-2"
                onClick={() => setIsCreditModalOpen(true)}
                disabled={creditLoading || isPurchasingCredits}
              >
                크레딧 충전하기
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>활동 요약</CardTitle>
              <CardDescription>최근 30일 기준 사용량 지표입니다.</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              {[
                { label: '생성한 프로젝트', value: '12', icon: UserRound },
                { label: '업로드 진행 중', value: '3', icon: PenSquare },
                { label: '알림 수신', value: '8', icon: Bell },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="border-surface-3 bg-surface-1 flex items-center gap-3 rounded-2xl border px-4 py-3"
                >
                  <div className="text-primary bg-primary/10 flex h-10 w-10 items-center justify-center rounded-2xl">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="text-muted text-xs uppercase tracking-wide">{label}</p>
                      <p className="text-foreground text-xl font-semibold">{value}</p>
                    </div>
                    <Badge tone="default" className="text-xs">
                      최근 30일
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <YoutubeIntegrationCard />
          <CreditTopupModal
            open={isCreditModalOpen}
            onOpenChange={setIsCreditModalOpen}
            packages={creditPackages}
            onPurchase={handlePurchasePackage}
            isPurchasing={isPurchasingCredits}
            currentBalance={creditBalance}
          />
        </div>
      )}
    </div>
  )
}
