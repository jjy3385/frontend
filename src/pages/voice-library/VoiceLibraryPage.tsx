import { useMemo, useState, useEffect, useRef, useCallback } from 'react'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, MoreVertical, Pause, Play, Search } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import { useNavigate } from 'react-router-dom'

import type { VoiceSample, VoiceSamplesResponse } from '@/entities/voice-sample/types'
import { fetchVoiceSamples, toggleFavorite } from '@/features/voice-samples/api/voiceSamplesApi'
import { useDeleteVoiceSample } from '@/features/voice-samples/hooks/useVoiceSamples'
import { VoiceSampleEditModal } from '@/features/voice-samples/modals/VoiceSampleEditModal'
import { env } from '@/shared/config/env'
import { routes } from '@/shared/config/routes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/Dropdown'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select'

type LibraryTab = 'library' | 'mine' | 'favorites'

const EMPTY_SAMPLES: VoiceSample[] = []
const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Voice&background=EEF2FF&color=1E1B4B&size=128'
const COUNTRY_DISPLAY_MAP: Record<string, { code: string; label: string }> = {
  ko: { code: 'KR', label: '한국' },
  kr: { code: 'KR', label: '한국' },
  en: { code: 'US', label: '영어권' },
  us: { code: 'US', label: '미국' },
  uk: { code: 'GB', label: '영국' },
  gb: { code: 'GB', label: '영국' },
  ja: { code: 'JP', label: '일본' },
  jp: { code: 'JP', label: '일본' },
  zh: { code: 'CN', label: '중국' },
  cn: { code: 'CN', label: '중국' },
}

const getPresignedUrl = async (path: string): Promise<string | undefined> => {
  try {
    const apiBase = env.apiBaseUrl.startsWith('http')
      ? `${env.apiBaseUrl}/api`
      : env.apiBaseUrl || '/api'
    const pathSegments = path.split('/')
    const encodedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join('/')
    const response = await fetch(`${apiBase}/storage/media/${encodedPath}`)
    if (!response.ok) {
      throw new Error(`Failed to get presigned URL: ${response.statusText}`)
    }
    const data = (await response.json()) as { url: string }
    return data.url
  } catch (error) {
    console.error('Presigned URL 가져오기 실패:', error)
    return undefined
  }
}

export default function VoiceLibraryPage() {
  const [tab, setTab] = useState<LibraryTab>('library')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'default' | 'favorite'>('default')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSample, setEditingSample] = useState<VoiceSample | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deleteVoiceSample = useDeleteVoiceSample()

  const queryKey = useMemo(() => ['voice-library', tab, search] as const, [tab, search])
  const voiceQuery = useQuery<
    VoiceSamplesResponse,
    Error,
    VoiceSamplesResponse,
    readonly [string, LibraryTab, string]
  >({
    queryKey,
    queryFn: () =>
      fetchVoiceSamples({
        q: search.trim() || undefined,
        favoritesOnly: tab === 'favorites',
        mySamplesOnly: tab === 'mine',
      }),
    placeholderData: keepPreviousData,
  })

  const favoriteMutation = useMutation<
    VoiceSample,
    Error,
    {
      sample: VoiceSample
      next: boolean
    }
  >({
    mutationFn: ({ sample, next }) => toggleFavorite(sample.id, next),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
  const mutateFavorite = favoriteMutation.mutate
  const isFavoriteLoading = Boolean(favoriteMutation.isPending)
  const isMyTab = tab === 'mine'

  const cleanupAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    audio.src = ''
    audio.load()
    audioRef.current = null
  }, [])

  const stopPlayback = useCallback(() => {
    cleanupAudio()
    setPlayingSampleId(null)
  }, [cleanupAudio])

  useEffect(() => {
    return () => {
      stopPlayback()
    }
  }, [stopPlayback])

  const resolveSampleAudioUrl = useCallback(async (sample: VoiceSample) => {
    const storageSegment = '/storage/media/'
    if (sample.audio_sample_url) {
      if (sample.audio_sample_url.includes(storageSegment)) {
        const path = sample.audio_sample_url.split(storageSegment).pop()
        if (path) {
          return getPresignedUrl(path)
        }
      } else {
        return sample.audio_sample_url
      }
    }
    if (sample.file_path_wav) {
      return getPresignedUrl(sample.file_path_wav)
    }
    if (sample.previewUrl) {
      return sample.previewUrl
    }
    return undefined
  }, [])

  const handlePlaySample = useCallback(
    (sample: VoiceSample) => {
      void (async () => {
        const sampleId = sample.id
        if (!sampleId) return

        if (playingSampleId === sampleId) {
          stopPlayback()
          return
        }

        stopPlayback()

        const audioUrl = await resolveSampleAudioUrl(sample)
        if (!audioUrl) {
          console.warn('재생 가능한 오디오 URL을 찾지 못했습니다.', sample)
          return
        }

        const audio = new Audio(audioUrl)
        audioRef.current = audio
        setPlayingSampleId(sampleId)

        audio.addEventListener('ended', () => {
          stopPlayback()
        })

        audio.play().catch((error) => {
          console.error('음성 재생 실패:', error)
          stopPlayback()
        })
      })()
    },
    [playingSampleId, resolveSampleAudioUrl, stopPlayback],
  )

  const handleEditSample = useCallback((sample: VoiceSample) => {
    setEditingSample(sample)
    setIsEditModalOpen(true)
  }, [])

  const handleDeleteSample = useCallback(
    (sample: VoiceSample) => {
      if (!sample.id) return
      if (!window.confirm(`"${sample.name}" 보이스를 삭제하시겠습니까?`)) return
      setDeletingId(sample.id)
      deleteVoiceSample.mutate(sample.id, {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
        },
        onSettled: () => {
          setDeletingId(null)
        },
      })
    },
    [deleteVoiceSample, queryClient],
  )

  const handleEditSuccess = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
  }, [queryClient])

  const samples = voiceQuery.data?.samples ?? EMPTY_SAMPLES
  const sortedSamples = useMemo(() => {
    if (sort === 'favorite') {
      return [...samples].sort(
        (a, b) => (b.favoriteCount ?? 0) - (a.favoriteCount ?? 0),
      )
    }
    return samples
  }, [samples, sort])
  const gridColumnsClass = isMyTab
    ? 'grid-cols-[minmax(0,2.5fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'
    : 'grid-cols-[minmax(0,2.7fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
            Voice Library
          </p>
          <p className="text-muted text-sm">등록된 보이스 클론을 찾아보고, 즐겨찾기에 추가해보세요.</p>
        </div>
        <Button variant="primary" onClick={() => navigate(routes.voiceCloning)}>
          보이스 클로닝 시작
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          {tabButton('library', '라이브러리', tab, setTab)}
          {tabButton('mine', '내 보이스', tab, setTab)}
          {tabButton('favorites', '즐겨찾기', tab, setTab)}
        </div>
        <div className="flex flex-1 min-w-[240px] items-center gap-3 rounded-3xl border border-surface-3 bg-surface-1/70 px-4 py-3 shadow-soft">
          <div className="relative flex-1">
            <Search className="text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="보이스 검색"
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(value) => setSort(value as 'default' | 'favorite')}>
            <SelectTrigger className="w-36 rounded-full border-surface-3 bg-surface-1 text-sm shadow-soft">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="default">기본</SelectItem>
              <SelectItem value="favorite">좋아요순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-0 rounded-3xl border border-surface-2 bg-surface-1 p-4 shadow-soft">
        {voiceQuery.isLoading ? (
          <p className="text-center text-muted text-sm">목록을 불러오는 중...</p>
        ) : sortedSamples.length === 0 ? (
          <p className="text-center text-muted text-sm">조건에 맞는 보이스가 없습니다.</p>
        ) : (
          <>
            <div
              className={`text-muted mb-1 grid ${gridColumnsClass} gap-4 text-xs font-semibold uppercase tracking-[0.2em]`}
            >
              <span className="flex min-h-[1.5rem] items-start truncate">이름</span>
              <span className="flex min-h-[1.5rem] items-start">국가</span>
              <span className="flex min-h-[1.5rem] items-start">성별</span>
              {isMyTab ? <span className="flex min-h-[1.5rem] items-start">공개 여부</span> : null}
              <span className="inline-flex min-h-[1.5rem] w-[74px] items-start justify-center">즐겨찾기</span>
              <span className="flex min-h-[1.5rem] items-start justify-end text-right" aria-hidden />
            </div>
            <ul className="divide-y divide-surface-3">
              {sortedSamples.map((sample) => (
                <VoiceLibraryRow
                  key={sample.id}
                  sample={sample}
                  onToggleFavorite={() =>
                    mutateFavorite({
                      sample,
                      next: !sample.isFavorite,
                    })
                  }
                  toggling={isFavoriteLoading}
                  onPlay={handlePlaySample}
                  isPlaying={playingSampleId === sample.id}
                  showVisibilityColumn={isMyTab}
                  showActions={isMyTab}
                  onEdit={handleEditSample}
                  onDelete={handleDeleteSample}
                  isDeleting={deletingId === sample.id}
                  gridClassName={gridColumnsClass}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      <VoiceSampleEditModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) {
            setEditingSample(null)
          }
        }}
        sample={editingSample}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}

function tabButton(
  value: LibraryTab,
  label: string,
  current: LibraryTab,
  setTab: (tab: LibraryTab) => void,
) {
  const isActive = current === value
  return (
    <button
      type="button"
      onClick={() => setTab(value)}
      className={`rounded-2xl px-5 py-2 text-sm font-semibold transition ${
        isActive
          ? 'bg-primary text-primary-foreground shadow'
          : 'bg-transparent text-muted hover:bg-surface-2 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}
function VoiceLibraryRow({
  sample,
  onToggleFavorite,
  toggling,
  onPlay,
  isPlaying,
  showVisibilityColumn = false,
  showActions = false,
  onEdit,
  onDelete,
  isDeleting = false,
  gridClassName,
}: {
  sample: VoiceSample
  onToggleFavorite: () => void
  toggling: boolean
  onPlay: (sample: VoiceSample) => void
  isPlaying: boolean
  showVisibilityColumn?: boolean
  showActions?: boolean
  onEdit?: (sample: VoiceSample) => void
  onDelete?: (sample: VoiceSample) => void
  isDeleting?: boolean
  gridClassName: string
}) {
  const [resolvedAvatar, setResolvedAvatar] = useState<string>(
    sample.avatarImageUrl && sample.avatarImageUrl.startsWith('http')
      ? sample.avatarImageUrl
      : DEFAULT_AVATAR,
  )

  useEffect(() => {
    let active = true
    const path = sample.avatarImagePath
    if (path && !path.startsWith('http')) {
      void getPresignedUrl(path).then((url) => {
        if (url && active) {
          setResolvedAvatar(url)
        }
      })
    } else if (sample.avatarImageUrl && sample.avatarImageUrl.startsWith('http')) {
      setResolvedAvatar(sample.avatarImageUrl)
    } else {
      setResolvedAvatar(DEFAULT_AVATAR)
    }
    return () => {
      active = false
    }
  }, [sample.avatarImagePath, sample.avatarImageUrl])

  return (
    <li className={`grid ${gridClassName} items-center gap-4 py-4 text-sm`}>
      <div className="group flex items-center gap-3 overflow-hidden">
        <div className="relative h-12 w-12 flex-shrink-0">
          <img
            src={resolvedAvatar}
            onError={(event) => {
              event.currentTarget.src = DEFAULT_AVATAR
            }}
            alt={sample.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          {sample.audio_sample_url || sample.file_path_wav || sample.previewUrl ? (
            <button
              type="button"
              onClick={() => {
                onPlay(sample)
              }}
              className={`absolute inset-0 flex items-center justify-center rounded-full text-white transition ${
                isPlaying ? 'bg-primary/80 opacity-100' : 'bg-black/70 opacity-0 group-hover:opacity-100'
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-base">{sample.name}</p>
          {sample.description ? (
            <p className="text-muted text-xs truncate">{sample.description}</p>
          ) : null}
        </div>
      </div>
      <CountryCell country={sample.country} />
      <p className="text-muted">{sample.gender ?? '성별 미상'}</p>
      {showVisibilityColumn ? <VisibilityBadge isPublic={sample.isPublic} /> : null}
      <button
        type="button"
        onClick={onToggleFavorite}
        disabled={toggling}
        className="inline-flex h-8 w-[74px] shrink-0 items-center justify-center gap-1 rounded-full border border-surface-3 px-1.5 text-xs font-medium"
      >
        <Heart className={`h-4 w-4 ${sample.isFavorite ? 'text-danger fill-danger/20' : 'text-muted'}`} />
        {sample.favoriteCount ?? 0}
      </button>
      <div className="flex items-center justify-end gap-2">
        {showActions ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-surface-3 p-0 text-muted transition hover:bg-surface-2"
                onClick={(event) => event.stopPropagation()}
                disabled={isDeleting}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  onEdit?.(sample)
                }}
              >
                편집
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-danger"
                onClick={() => {
                  onDelete?.(sample)
                }}
                disabled={isDeleting}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </li>
  )
}

function CountryCell({ country }: { country?: string }) {
  const countryCode = useMemo(() => {
    if (!country) return undefined
    const normalized = country.trim().toLowerCase()
    const mapped = COUNTRY_DISPLAY_MAP[normalized]
    if (mapped) return mapped.code
    if (country.length === 2) {
      return country.toUpperCase()
    }
    return undefined
  }, [country])

  return (
    <div className="flex items-center text-muted">
      {countryCode ? (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-200 text-emerald-900">
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{ width: '1.25em', height: '1.25em' }}
            title={country ?? '국적'}
          />
        </span>
      ) : null}
    </div>
  )
}

function VisibilityBadge({ isPublic }: { isPublic?: boolean }) {
  if (typeof isPublic === 'undefined') {
    return <span className="text-muted text-sm">-</span>
  }
  return (
    <span
      className={`inline-flex min-w-[72px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
        isPublic ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
      }`}
    >
      {isPublic ? '공개' : '비공개'}
    </span>
  )
}
