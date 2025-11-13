import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { useEffect } from 'react'

import { getTimelineWidth } from '@/features/editor/utils/timeline-scale'
import { useEditorStore } from '@/shared/store/useEditorStore'

import { PlayheadIndicator } from './PlayheadIndicator'
import { TimeRuler } from './TimeRuler'
import { TrackRow as TrackRowComponent } from './TrackRow'
import type { TrackRow } from './types'

type WaveformBar = {
  id: number
  height: number
}

type AudioTimelineProps = {
  trackRows: TrackRow[]
  timelineTicks: number[]
  waveformData: WaveformBar[]
  timelineRef: RefObject<HTMLDivElement>
  playheadPercent: number
  onTimelinePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  rowHeight: number
  duration: number
  playhead: number
}

/**
 * AudioTimeline 메인 컴포넌트
 *
 * 레이어 구조 (z-index 순서):
 * 1. 기본 레이어 (z-index 없음): TimeRuler, TrackRow 배경
 * 2. z-10: SpeakerSegment (클릭 가능한 세그먼트들)
 * 3. z-20: 타임라인 컨테이너 (포인터 이벤트 처리)
 * 4. z-[100]: PlayheadIndicator (최상위 - 삼각형과 세로선)
 */
export function AudioTimeline({
  trackRows,
  timelineTicks,
  waveformData,
  timelineRef,
  // playheadPercent,
  onTimelinePointerDown,
  rowHeight,
  duration,
  playhead,
}: AudioTimelineProps) {
  const { scale, setDuration } = useEditorStore((state) => ({
    scale: state.scale,
    setDuration: state.setDuration,
  }))

  // Set duration when component mounts or duration changes
  useEffect(() => {
    if (duration > 0) {
      setDuration(duration)
    }
  }, [duration, setDuration])

  const timelineWidth = getTimelineWidth(duration, scale)
  return (
    <div className="bg-surface-1 relative flex flex-1 flex-col overflow-hidden">
      {/* 재생 위치 표시자 (최상위 레이어) */}
      <PlayheadIndicator playhead={playhead} duration={duration} scale={scale} />

      {/* 시간 눈금자 */}
      <TimeRuler
        timelineTicks={timelineTicks}
        duration={duration}
        scale={scale}
        onTimelinePointerDown={onTimelinePointerDown}
      />

      {/* 타임라인 콘텐츠 영역 */}
      <div className="flex-1 overflow-hidden" ref={timelineRef}>
        <div
          className="relative z-20 select-none"
          style={{
            minHeight: trackRows.length * rowHeight,
            width: `${timelineWidth}px`,
          }}
        >
          {/* 트랙 행들 */}
          {trackRows.map((track, index) => (
            <TrackRowComponent
              key={track.id}
              track={track}
              index={index}
              duration={duration}
              scale={scale}
              waveformData={track.type === 'waveform' ? waveformData : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
