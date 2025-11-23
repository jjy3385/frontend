import type { Segment } from '@/entities/segment/types'
import type { TrackRow } from '@/features/editor/components/audio-track/types'

/**
 * Segments를 speaker_tag 기준으로 그룹화하여 TrackRow 배열로 변환합니다.
 *
 * @param segments - 변환할 세그먼트 배열
 * @returns speaker 트랙 배열
 */
export function convertSegmentsToTracks(segments: Segment[]): TrackRow[] {
  if (segments.length === 0) return []

  // 색상 팔레트
  const palette = [
    '#EF4444', // 1: red (first speaker 강조, 더 선명)
    '#475D91', // 2: primary blue
    '#2F7D67', // 3: green
    '#725572', // 4: tertiary purple
    '#C27C2A', // 5: amber
    '#1B7F4D', // 6: deep green variation
    '#233B6D', // 7: deeper primary variation
    '#00897B', // 8: teal
    '#6F4E7C', // 9: muted purple variation
  ]

  // speaker_tag 기준으로 그룹화
  const speakerMap = new Map<
    string,
    { id: string; label: string; color: string; segments: Segment[] }
  >()

  segments.forEach((segment, index) => {
    const speakerId = segment.speaker_tag ?? `speaker-${index + 1}`
    if (!speakerMap.has(speakerId)) {
      speakerMap.set(speakerId, {
        id: speakerId,
        label: segment.speaker_tag ?? `Speaker ${speakerMap.size + 1}`,
        color: palette[speakerMap.size % palette.length],
        segments: [],
      })
    }
    speakerMap.get(speakerId)?.segments.push(segment)
  })

  // TrackRow 배열로 변환
  const tracks: TrackRow[] = Array.from(speakerMap.values()).map((track) => ({
    ...track,
    type: 'speaker' as const,
    size: 'medium' as const,
  }))

  return tracks
}
