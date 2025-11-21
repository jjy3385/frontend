import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
  useSSEStore,
  type AudioGenerationEvent,
} from '@/features/projects/stores/useSSEStore'
import { queryKeys } from '@/shared/config/queryKeys'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { useTracksStore } from '@/shared/store/useTracksStore'

import type { EditorState } from './useEditorState'

/**
 * 전역 SSE 연결을 통해 오디오 생성 이벤트를 구독하는 훅
 *
 * useGlobalSSE에서 발생하는 오디오 이벤트 중
 * 현재 projectId + languageCode에 해당하는 이벤트만 처리
 *
 * @param projectId - 프로젝트 ID
 * @param languageCode - 언어 코드
 * @param enabled - 구독 활성화 여부
 */
export function useAudioEventSubscription(
  projectId: string,
  languageCode: string,
  enabled = true,
) {
  const queryClient = useQueryClient()
  const setSegmentLoading = useEditorStore((state) => state.setSegmentLoading)
  const updateSegment = useTracksStore((state) => state.updateSegment)
  const subscribeToAudioEvents = useSSEStore((state) => state.subscribeToAudioEvents)

  useEffect(() => {
    if (!enabled || !projectId || !languageCode) return

    console.log('[AudioSubscription] Subscribing:', { projectId, languageCode })

    const handleAudioEvent = (event: AudioGenerationEvent) => {
      const { segmentId, audioS3Key, audioDuration, status, error } = event

      if (status === 'completed') {
        console.log('[AudioSubscription] Audio completed:', { segmentId, audioS3Key, audioDuration })

        // Update EditorState query cache
        queryClient.setQueryData<EditorState>(
          queryKeys.editor.state(projectId, languageCode),
          (oldState) => {
            if (!oldState) return oldState

            return {
              ...oldState,
              segments: oldState.segments.map((seg) => {
                if (seg.id === segmentId) {
                  const newEnd = audioDuration !== undefined ? seg.start + audioDuration : seg.end
                  return {
                    ...seg,
                    segment_audio_url: audioS3Key,
                    end: newEnd,
                  }
                }
                return seg
              }),
            }
          },
        )

        // Sync TracksStore
        const updates: Record<string, unknown> = {
          segment_audio_url: audioS3Key,
        }
        if (audioDuration !== undefined) {
          const currentSegment = queryClient.getQueryData<EditorState>(
            queryKeys.editor.state(projectId, languageCode),
          )
          const segment = currentSegment?.segments.find((s) => s.id === segmentId)
          if (segment) {
            updates.end = segment.start + audioDuration
          }
        }
        updateSegment(segmentId, updates)
        setSegmentLoading(segmentId, false)
      } else if (status === 'failed') {
        console.error('[AudioSubscription] Audio failed:', { segmentId, error })
        setSegmentLoading(segmentId, false)
      }
    }

    // Subscribe and get unsubscribe function
    const unsubscribe = subscribeToAudioEvents(projectId, languageCode, handleAudioEvent)

    return () => {
      console.log('[AudioSubscription] Unsubscribing:', { projectId, languageCode })
      unsubscribe()
    }
  }, [
    projectId,
    languageCode,
    enabled,
    queryClient,
    setSegmentLoading,
    updateSegment,
    subscribeToAudioEvents,
  ])
}
