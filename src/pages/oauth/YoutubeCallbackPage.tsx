import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { connectYoutube } from '@/features/auth/api/youtubeApi'
import { routes } from '@/shared/config/routes'
import { useUiStore } from '@/shared/store/useUiStore'
import { Spinner } from '@/shared/ui/Spinner'

export default function YoutubeCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const showToast = useUiStore((state) => state.showToast)

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const description = searchParams.get('error_description')

    if (error) {
      showToast({
        title: 'YouTube 연동 실패',
        description: description ?? 'Google 인증을 취소했습니다.',
        autoDismiss: 4000,
      })
      navigate(routes.myinfo, { replace: true })
      return
    }

    if (!code) {
      showToast({
        title: 'YouTube 연동 실패',
        description: 'Google에서 인증 코드를 받지 못했습니다.',
        autoDismiss: 4000,
      })
      navigate(routes.myinfo, { replace: true })
      return
    }

    let cancelled = false
    const linkYoutube = async () => {
      try {
        await connectYoutube(code)
        if (!cancelled) {
          showToast({
            title: '연동 완료',
            description: 'YouTube 채널이 연결되었습니다.',
          })
        }
      } catch (err) {
        if (!cancelled) {
          showToast({
            title: 'YouTube 연동 실패',
            description: err instanceof Error ? err.message : '다시 시도해 주세요.',
            autoDismiss: 4000,
          })
        }
      } finally {
        if (!cancelled) {
          navigate(routes.myinfo, { replace: true })
        }
      }
    }

    void linkYoutube()
    return () => {
      cancelled = true
    }
  }, [navigate, searchParams, showToast])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-muted text-sm">Google 인증을 처리하는 중입니다…</p>
    </div>
  )
}

