import type { Segment } from '@/entities/segment/types'
import { useAudioWaveform } from '@/features/editor/hooks/useAudioWaveform'
import { timeToPixel } from '@/features/editor/utils/timeline-scale'
import { usePresignedUrl } from '@/shared/api/hooks'
import { cn } from '@/shared/lib/utils'

import { SegmentLoadingSpinner, SegmentWaveform } from './SegmentWaveform'

type SpeakerSegmentProps = {
  segment: Segment
  duration: number
  scale: number
  color: string
}

/**
 * 개별 스피커 세그먼트를 표시하는 컴포넌트
 * z-index: z-10 (트랙 레이어 위, PlayheadIndicator 아래)
 *
 * - Presigned URL 로드 → 파형 생성 → 렌더링
 * - 로딩 중에는 스켈레톤 표시
 */
export function SpeakerSegment({ segment, duration, scale, color }: SpeakerSegmentProps) {
  const startPx = timeToPixel(segment.start, duration, scale)
  const widthPx = Math.max(timeToPixel(segment.end - segment.start, duration, scale), 64)

  const { data: audioSrc, isLoading: urlLoading } = usePresignedUrl(segment.segment_audio_url, {
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  })

  const { data: waveformData, isLoading: waveformLoading } = useAudioWaveform(
    audioSrc,
    !!audioSrc,
    Math.min(Math.floor(widthPx / 4), 100), // Dynamic sample count based on width
  )

  const isLoading = urlLoading || waveformLoading

  return (
    <div
      className={cn(
        'absolute top-3 z-10 flex h-[60px] items-center justify-between rounded-2xl border px-3 text-xs font-semibold transition-opacity',
        isLoading && 'opacity-60',
      )}
      style={{
        left: `${startPx}px`,
        width: `${widthPx}px`,
        backgroundColor: `${color}20`,
        borderColor: color,
        color: color,
      }}
    >
      {/* Waveform visualization */}
      {isLoading ? (
        <SegmentLoadingSpinner color={color} size="sm" />
      ) : waveformData ? (
        <SegmentWaveform waveformData={waveformData} color={color} height={40} />
      ) : null}

      {/* Segment labels */}
      <div className="relative z-10 flex w-full items-center justify-between">
        {/* <span className="text-xs">{segment.speaker_tag}</span> */}
        {/* <div className="text-nowrap text-[10px]">
          {segment.start.toFixed(1)}s ~ {segment.end.toFixed(1)}s
        </div> */}
      </div>
    </div>
  )
}
