import type { Segment } from '@/entities/segment/types'
import { timeToPixel } from '@/features/editor/utils/timeline-scale'

type SpeakerSegmentProps = {
  segment: Segment
  duration: number
  scale: number
  color: string
}

/**
 * 개별 스피커 세그먼트를 표시하는 컴포넌트
 * z-index: z-10 (트랙 레이어 위, PlayheadIndicator 아래)
 */
export function SpeakerSegment({ segment, duration, scale, color }: SpeakerSegmentProps) {
  const startPx = timeToPixel(segment.start, duration, scale)
  const widthPx = Math.max(timeToPixel(segment.end - segment.start, duration, scale), 64)

  return (
    <div
      className="absolute top-3 z-10 flex h-[60px] items-center justify-between rounded-2xl border px-3 text-xs font-semibold"
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
