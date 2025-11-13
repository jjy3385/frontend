import type { Segment } from '@/entities/segment/types'

import { AudioTimeline } from './audio-track/AudioTimeline'
import { AudioTimelineControls } from './audio-track/AudioTimelineControls'
// import { AudioTrackHeader } from './audio-track/AudioTrackHeader'
import { AudioTrackSidebar } from './audio-track/AudioTrackSidebar'
import { useAudioTimeline } from './audio-track/useAudioTimeline'

type AudioTrackWorkspaceProps = {
  segments: Segment[]
  duration: number
}

export function AudioTrackWorkspace({ segments, duration }: AudioTrackWorkspaceProps) {
  const {
    // playbackRate,
    // setPlaybackRate,
    trackRows,
    timelineTicks,
    waveformData,
    timelineRef,
    playheadPercent,
    onTimelinePointerDown,
    rowHeight,
    playhead,
    setPlayhead,
    isPlaying,
    togglePlayback,
    formatTime,
  } = useAudioTimeline(segments, duration)
  return (
    <section className="border-surface-3 bg-surface-1 flex h-full flex-col gap-3 border-t shadow-soft">
      {/* <AudioTrackHeader
        playbackRate={playbackRate}
        onDecreaseRate={() => setPlaybackRate(Math.max(playbackRate - 0.1, 0.5))}
        onIncreaseRate={() => setPlaybackRate(Math.min(playbackRate + 0.1, 2))}
      /> */}
      <div className="border-surface-3 flex min-h-0 flex-1 flex-col rounded-2xl border">
        {/* Controls - always visible at the top */}
        <AudioTimelineControls
          playhead={playhead}
          duration={duration}
          setPlayhead={setPlayhead}
          togglePlayback={togglePlayback}
          isPlaying={isPlaying}
          formatTime={formatTime}
        />

        {/* Timeline area with sidebar */}
        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[220px,1fr]">
          <div className="border-surface-3 sticky left-0 top-0 z-10 hidden h-full border-r lg:block">
            <AudioTrackSidebar trackRows={trackRows} />
          </div>

          <div className="bg-surface-1 overflow-hidden">
            <AudioTimeline
              trackRows={trackRows}
              timelineTicks={timelineTicks}
              waveformData={waveformData}
              timelineRef={timelineRef}
              playheadPercent={playheadPercent}
              onTimelinePointerDown={onTimelinePointerDown}
              rowHeight={rowHeight}
              duration={duration}
              playhead={playhead}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
