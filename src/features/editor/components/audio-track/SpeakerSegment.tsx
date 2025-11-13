import type { MouseEvent as ReactMouseEvent } from 'react'
import type { Segment } from '@/entities/segment/types'
import { timeToPixel } from '@/features/editor/utils/timeline-scale'
import { useEditorStore } from '@/shared/store/useEditorStore'

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
 * 클릭 시 해당 위치부터 오디오 재생
 */
export function SpeakerSegment({ segment, duration, scale, color }: SpeakerSegmentProps) {
  const { playSegmentAudio, setPlayhead, setSegmentEnd } = useEditorStore((state) => ({
    playSegmentAudio: state.playSegmentAudio,
    setPlayhead: state.setPlayhead,
    setSegmentEnd: state.setSegmentEnd,
  }))

  const startPx = timeToPixel(segment.start, duration, scale)
  const widthPx = Math.max(timeToPixel(segment.end - segment.start, duration, scale), 64)

  const handleSegmentClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!segment.segment_audio_url) return

    const rect = event.currentTarget.getBoundingClientRect()
    const segmentDuration = segment.end - segment.start
    const clickRatio =
      rect.width > 0 ? Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1) : 0
    const timelinePosition = segment.start + clickRatio * segmentDuration
    const localOffset = clickRatio * segmentDuration

    setPlayhead(timelinePosition)
    setSegmentEnd(segment.end)
    playSegmentAudio(segment.segment_audio_url, {
      audioOffset: localOffset,
      timelinePosition,
    })
  }

  return (
    <div
      className="absolute top-3 z-10 flex h-[60px] cursor-pointer items-center justify-between rounded-2xl border px-3 text-xs font-semibold transition-opacity hover:opacity-80"
      onClick={handleSegmentClick}
      style={{
        left: `${startPx}px`,
        width: `${widthPx}px`,
        backgroundColor: `${color}20`,
        borderColor: color,
        color: color,
      }}
    >
      <span>{segment.speaker_tag}</span>
      <span className="text-[10px] opacity-75">
        {segment.start.toFixed(1)}s → {segment.end.toFixed(1)}s
      </span>
    </div>
  )
}