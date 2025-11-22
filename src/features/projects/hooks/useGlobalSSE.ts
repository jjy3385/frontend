import { useEffect, useRef, useCallback } from 'react'

import { env } from '@/shared/config/env'
import { useNotificationStore } from '@/shared/store/useNotificationStore'
import { useUiStore } from '@/shared/store/useUiStore'

import { getLanguageDisplayName, NOTIFICATION_MESSAGES } from '../constants/notificationMessages'
import { useProjectProgressStore } from '../stores/useProjectProgressStore'
import { useSSEStore } from '../stores/useSSEStore'
import type { ProjectProgressEvent, TargetProgressEvent } from '../types/progress'

import {
  createProjectCompletionChecker,
  createTargetCompletionChecker,
} from './utils/progressCompletion'
import {
  createConnectedHandler,
  createErrorMessageHandler,
  createHeartbeatHandler,
  createProjectProgressHandler,
  createTargetProgressHandler,
} from './utils/progressEventHandlers'
import { createConnectionErrorHandler, createReconnectionHandler } from './utils/sseReconnection'

export interface UseGlobalSSEOptions {
  projectId?: string
  enabled?: boolean
  onTargetComplete?: (projectId: string, targetLang: string, message: string) => void
  onProjectComplete?: (projectId: string, message: string) => void
}

/**
 * 전역 SSE 연결 훅
 *
 * 단일 SSE 연결로 다양한 이벤트 타입을 처리:
 * - target-progress: 번역 언어 파이프라인 진행률
 * - project-progress: 에피소드 전체 진행률
 * - audio-completed: 오디오 생성 완료
 * - audio-failed: 오디오 생성 실패
 *
 * 오디오 이벤트는 useSSEStore를 통해 구독자에게 전달됨
 */
export function useGlobalSSE({
  projectId,
  enabled = true,
  onTargetComplete,
  onProjectComplete,
}: UseGlobalSSEOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const previousTargetStatusRef = useRef<Map<string, string>>(new Map())
  const previousProjectStatusRef = useRef<Map<string, string>>(new Map())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const connectRef = useRef<() => void>()

  const showToast = useUiStore((state) => state.showToast)
  const addNotification = useNotificationStore((state) => state.addNotification)

  // Progress store actions
  const {
    setConnectionStatus: setProgressConnectionStatus,
    setConnectionError: setProgressConnectionError,
    setLastHeartbeat: setProgressLastHeartbeat,
    updateTargetProgress,
    updateProjectProgress,
  } = useProjectProgressStore()

  // SSE store actions (for audio events)
  const {
    setConnectionStatus: setSSEConnectionStatus,
    setConnectionError: setSSEConnectionError,
    setLastHeartbeat: setSSELastHeartbeat,
    notifyAudioEvent,
  } = useSSEStore()

  // Sync connection status to both stores
  const setConnectionStatus = useCallback(
    (status: 'disconnected' | 'connecting' | 'connected' | 'error') => {
      setProgressConnectionStatus(status)
      setSSEConnectionStatus(status)
    },
    [setProgressConnectionStatus, setSSEConnectionStatus],
  )

  const setConnectionError = useCallback(
    (error: string | null) => {
      setProgressConnectionError(error)
      setSSEConnectionError(error)
    },
    [setProgressConnectionError, setSSEConnectionError],
  )

  const setLastHeartbeat = useCallback(
    (timestamp: string) => {
      setProgressLastHeartbeat(timestamp)
      setSSELastHeartbeat(timestamp)
    },
    [setProgressLastHeartbeat, setSSELastHeartbeat],
  )

  // Completion checkers
  const checkTargetCompletion = useCallback(
    (event: TargetProgressEvent) => {
      const checker = createTargetCompletionChecker(
        previousTargetStatusRef.current,
        (projectId, projectTitle, targetLang, message) => {
          const languageDisplay = getLanguageDisplayName(targetLang)
          const notificationMessage = NOTIFICATION_MESSAGES.TARGET_COMPLETED(
            projectTitle,
            languageDisplay,
            targetLang,
          )

          showToast({
            id: `target-completed-${projectId}:${targetLang}`,
            title: '더빙 생성이 완료되었습니다',
            description: notificationMessage,
            autoDismiss: 6000,
            variant: 'success',
          })

          addNotification({
            type: 'success',
            title: '더빙 생성이 완료되었습니다',
            message: notificationMessage,
            projectId,
            targetLanguage: targetLang,
          })

          onTargetComplete?.(projectId, targetLang, message)
        },
      )
      checker(event)
    },
    [showToast, addNotification, onTargetComplete],
  )

  const checkProjectCompletion = useCallback(
    (event: ProjectProgressEvent) => {
      const checker = createProjectCompletionChecker(
        previousProjectStatusRef.current,
        (projectId, message) => {
          onProjectComplete?.(projectId, message)
        },
      )
      checker(event)
    },
    [onProjectComplete],
  )

  // Connect to SSE
  const connect = useCallback(() => {
    if (!enabled || eventSourceRef.current?.readyState === EventSource.OPEN) return

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    const url = new URL(`${env.apiBaseUrl}/api/progress/events`)
    if (projectId) {
      url.searchParams.set('project_id', projectId)
    }

    console.log('[GlobalSSE] Connecting:', url.toString())
    setConnectionStatus('connecting')

    const eventSource = new EventSource(url.toString(), {
      withCredentials: true,
    })

    const deps = {
      setConnectionStatus,
      setConnectionError,
      setLastHeartbeat,
      updateTargetProgress,
      updateProjectProgress,
      showToast,
      checkTargetCompletion,
      checkProjectCompletion,
    }

    // Progress event handlers
    eventSource.addEventListener(
      'connected',
      createConnectedHandler(deps, reconnectAttemptsRef, showToast),
    )
    eventSource.addEventListener('target-progress', createTargetProgressHandler(deps))
    eventSource.addEventListener('project-progress', createProjectProgressHandler(deps))
    eventSource.addEventListener('heartbeat', createHeartbeatHandler(deps))
    eventSource.addEventListener('error-message', createErrorMessageHandler(deps))

    // Audio generation event handlers (NEW)
    // Server sends: { projectId, targetLang, metadata: { segmentId, languageCode, audioS3Key, audioDuration } }
    eventSource.addEventListener('audio-completed', (event: MessageEvent) => {
      try {
        const raw = JSON.parse(event.data as string) as {
          projectId: string
          targetLang: string
          metadata: {
            segmentId: string
            languageCode: string
            audioS3Key: string
            audioDuration?: number
          }
        }
        console.log('[GlobalSSE] Audio completed:', raw)

        // Transform to AudioGenerationEvent format
        notifyAudioEvent({
          projectId: raw.projectId,
          languageCode: raw.metadata.languageCode || raw.targetLang,
          segmentId: raw.metadata.segmentId,
          audioS3Key: raw.metadata.audioS3Key,
          audioDuration: raw.metadata.audioDuration,
          status: 'completed',
        })
      } catch (error) {
        console.error('[GlobalSSE] Failed to parse audio-completed:', error)
      }
    })

    eventSource.addEventListener('audio-failed', (event: MessageEvent) => {
      try {
        const raw = JSON.parse(event.data as string) as {
          projectId: string
          targetLang: string
          metadata: {
            segmentId: string
            languageCode: string
            error?: string
          }
        }
        console.log('[GlobalSSE] Audio failed:', raw)

        notifyAudioEvent({
          projectId: raw.projectId,
          languageCode: raw.metadata.languageCode || raw.targetLang,
          segmentId: raw.metadata.segmentId,
          audioS3Key: '',
          status: 'failed',
          error: raw.metadata.error,
        })
      } catch (error) {
        console.error('[GlobalSSE] Failed to parse audio-failed:', error)
      }
    })

    // Reconnection logic
    const attemptReconnect = createReconnectionHandler(
      reconnectAttemptsRef,
      reconnectTimeoutRef,
      setConnectionStatus,
      showToast,
      () => connectRef.current?.(),
    )

    eventSource.onerror = createConnectionErrorHandler(
      eventSource,
      setConnectionStatus,
      attemptReconnect,
    )

    eventSourceRef.current = eventSource
  }, [
    enabled,
    projectId,
    setConnectionStatus,
    setConnectionError,
    setLastHeartbeat,
    updateTargetProgress,
    updateProjectProgress,
    checkTargetCompletion,
    checkProjectCompletion,
    showToast,
    notifyAudioEvent,
  ])

  connectRef.current = connect

  useEffect(() => {
    if (enabled) {
      connect()
    }

    const cleanup = () => {
      console.log('[GlobalSSE] Cleanup')

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = undefined
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      setConnectionStatus('disconnected')
      setConnectionError(null)
      reconnectAttemptsRef.current = 0
    }

    const handleBeforeUnload = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, projectId])

  const connectionStatus = useSSEStore((state) => state.connectionStatus)
  const connectionError = useSSEStore((state) => state.connectionError)

  return { connectionStatus, connectionError }
}
