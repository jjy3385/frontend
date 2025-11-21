import { useMemo, useState, useEffect } from 'react'

import { Check, Pause, Play, Plus } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/ui/Spinner'
import { VOICE_CATEGORY_MAP } from '@/shared/constants/voiceCategories'
import { DEFAULT_AVATAR, getPresetAvatarUrl } from '@/features/voice-samples/components/voiceSampleFieldUtils'

const COUNTRY_DISPLAY_MAP: Record<string, { code: string; label: string }> = {
  ko: { code: 'KR', label: '한국어' },
  kr: { code: 'KR', label: '한국어' },
  en: { code: 'US', label: '영어' },
  jp: { code: 'JP', label: '일본어' },
  es: { code: 'ES', label: '스페인어' },
  fr: { code: 'FR', label: '프랑스어' },
}

interface VoiceHighlightChipProps {
  sample: VoiceSample
  onPlay: (sample: VoiceSample) => void
  isPlaying: boolean
  onAddToMyVoices?: () => void
  onRemoveFromMyVoices?: () => void
  isAdding?: boolean
  isRemoving?: boolean
  isInMyVoices?: boolean
}

export function VoiceHighlightChip({
  sample,
  onPlay,
  isPlaying,
  onAddToMyVoices,
  onRemoveFromMyVoices,
  isAdding = false,
  isRemoving = false,
  isInMyVoices = false,
}: VoiceHighlightChipProps) {
  const [resolvedAvatar, setResolvedAvatar] = useState<string>(
    getPresetAvatarUrl(sample.avatarPreset) && getPresetAvatarUrl(sample.avatarPreset)!.startsWith('/')
      ? getPresetAvatarUrl(sample.avatarPreset)!
      : sample.avatarImageUrl && sample.avatarImageUrl.startsWith('http')
        ? sample.avatarImageUrl
        : DEFAULT_AVATAR,
  )
  const hasAudioUrl = Boolean(sample.audio_sample_url)
  const isProcessing = !hasAudioUrl

  useEffect(() => {
    const presetUrl = getPresetAvatarUrl(sample.avatarPreset)
    if (presetUrl) {
      setResolvedAvatar(presetUrl)
    } else if (sample.avatarImageUrl && sample.avatarImageUrl.startsWith('http')) {
      setResolvedAvatar(sample.avatarImageUrl)
    } else {
      setResolvedAvatar(DEFAULT_AVATAR)
    }
  }, [sample.avatarImageUrl, sample.avatarPreset])

  const countryCode = useMemo(() => {
    if (!sample.country) return undefined
    const normalized = sample.country.trim().toLowerCase()
    const mapped = COUNTRY_DISPLAY_MAP[normalized]
    if (mapped) return mapped.code
    if (sample.country.length === 2) {
      return sample.country.toUpperCase()
    }
    return undefined
  }, [sample.country])

  const displayName = sample.name || 'Unknown'
  const initials = displayName[0]?.toUpperCase() || 'V'


  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (isProcessing) return
        onPlay(sample)
      }}
      className={cn(
        // ElevenLabs 스타일: 작은 카드 / 라운드 / 은은한 그림자
        'group flex items-center gap-3 rounded-3xl',
        'bg-surface-1 px-3 py-3 shadow-sm',
        'border border-surface-3',
        'transition-all hover:-translate-y-[1px] hover:shadow-md',
      )}
    >
      {/* 아바타 */}
      <div
        className={cn(
          'relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full',
          'bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-semibold text-white',
        )}
      >
        {resolvedAvatar && resolvedAvatar !== DEFAULT_AVATAR ? (
          <img
            src={resolvedAvatar}
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
            alt={sample.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <Spinner size="sm" />
          </div>
        )}
      </div>

        {/* 텍스트 영역 */}
        <div className="min-w-0 flex-1 text-left">
          {/* 이름 */}
          <div className="truncate text-sm font-semibold text-foreground">{displayName}</div>
          {/* 두 번째 줄: 카테고리 */}
          <div className="truncate text-[11px] text-muted">
            {sample.category?.length
              ? VOICE_CATEGORY_MAP[sample.category[0] as keyof typeof VOICE_CATEGORY_MAP] ??
                sample.category[0]
              : '카테고리 미지정'}
          </div>
          {/* 세 번째 줄: 언어/국기 및 사용 수 */}
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
            {countryCode && (
              <ReactCountryFlag
                countryCode={countryCode}
                svg
                style={{ width: '0.8em', height: '0.8em' }}
              />
            )}
            <span className="truncate">
              {(COUNTRY_DISPLAY_MAP[sample.country?.toLowerCase() ?? '']?.label ??
                sample.country) ||
                '언어 미상'}
            </span>
            <span className="text-muted">•</span>
            <span className="truncate">{`${sample.addedCount ?? 0}명 사용`}</span>
          </div>
          {sample.tags?.length ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {sample.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center gap-1">
        {/* 재생 버튼 */}
        {!isProcessing && sample.audio_sample_url && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPlay(sample)
            }}
            title={isPlaying ? '일시정지' : '재생'}
            className="flex-shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        )}
        {/* + 버튼 */}
        {(onAddToMyVoices || onRemoveFromMyVoices) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (isInMyVoices && onRemoveFromMyVoices) {
                onRemoveFromMyVoices()
              } else if (!isInMyVoices && onAddToMyVoices) {
                onAddToMyVoices()
              }
            }}
            disabled={isAdding || isRemoving}
            title={isInMyVoices ? '내 목소리에서 제거' : '내 목소리에 추가'}
            className={cn(
              'flex-shrink-0 rounded-full p-1.5 transition-colors',
              isInMyVoices
                ? 'text-primary hover:bg-surface-2'
                : 'text-muted hover:bg-surface-2 hover:text-foreground',
              (isAdding || isRemoving) && 'cursor-not-allowed opacity-50',
            )}
          >
            {isAdding || isRemoving ? (
              <Spinner size="sm" />
            ) : isInMyVoices ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </button>
  )
}
