import { useEffect, useRef } from 'react'

import { env } from '@/shared/config/env'
import { usePipelineProgressStore } from '@/shared/store/usePipelineProgressStore'

type PipelineStage = {
  id: string
  status?: string
  progress?: number | string
}

type PipelineEventPayload = {
  current_stage?: string
  status?: string
  overall_progress?: number | string
  stages?: PipelineStage[]
  message?: string
  error?: string
}

const pipelineStages = [
  'upload',
  'stt',
  'mt',
  'rag',
  'voice_mapping',
  'tts',
  'packaging',
  'outputs',
]

const stageLabelMap: Record<string, string> = {
  upload: '업로드 처리 중',
  stt: '음성 인식 중',
  mt: '번역 중',
  rag: 'RAG 응답 생성 중',
  voice_mapping: '화자 매핑 중',
  tts: '음성 합성 중',
  packaging: '결과 패키징 중',
  outputs: '결과 저장 중',
  done: '처리가 완료되었습니다.',
}

const normalizeProgress = (value?: number | string) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(Math.max(value, 0), 100)
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) {
      return Math.min(Math.max(parsed, 0), 100)
    }
  }
  return undefined
}

const computeOverallProgress = (payload: PipelineEventPayload) => {
  const normalizedOverall = normalizeProgress(payload.overall_progress)
  if (normalizedOverall !== undefined) {
    return normalizedOverall
  }

  const stage = payload.current_stage
  const normalizedStage = normalizeProgress(
    payload.stages?.find((s) => s.id === stage)?.progress,
  ) ?? 0
  if (!stage) {
    return normalizedStage
  }

  const index = pipelineStages.indexOf(stage)
  if (index === -1) {
    return normalizedStage
  }

  const segment = 100 / pipelineStages.length
  const base = index * segment
  return Math.min(base + (normalizedStage / 100) * segment, 100)
}

export function usePipelineProgress(projectId?: string, enabled = true) {
  const setProgress = usePipelineProgressStore((state) => state.setProgress)
  const removeProgress = usePipelineProgressStore((state) => state.removeProgress)
  const progressItem = usePipelineProgressStore((state) =>
    projectId ? state.items[projectId] : undefined,
  )
  const lastProgressRef = useRef(0)

  useEffect(() => {
    lastProgressRef.current = 0
  }, [projectId])

  useEffect(() => {
    if (!projectId || !enabled) {
      if (projectId) {
        removeProgress(projectId)
      }
      return
    }

    const url = `${env.apiBaseUrl}/api/pipeline/${projectId}/events`
    const source = new EventSource(url)

    const handleEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data as string) as PipelineEventPayload
        const stageKey = (payload.current_stage ?? '').toLowerCase()
        const failureStage =
          payload.status === 'failed'
            ? stageKey
            : payload.stages?.find(
                (stage) => (stage.status ?? '').toLowerCase() === 'failed',
              )?.id?.toLowerCase()
        const isFailed = Boolean(failureStage)
        const baseProgress = computeOverallProgress(payload)
        const progressValue = isFailed ? lastProgressRef.current : baseProgress
        const baseMessage =
          payload.message ??
          stageLabelMap[failureStage ?? stageKey] ??
          failureStage ??
          (stageKey || '처리 중')
        const message = isFailed ? `${baseMessage} 실패` : baseMessage
        const completedByStages =
          payload.stages?.length &&
          payload.stages.every(
            (stage) => (stage.status ?? '').toLowerCase() === 'completed',
          )
        const isCompleted =
          !isFailed &&
          (stageKey === 'done' ||
            payload.status === 'done' ||
            payload.status === 'completed' ||
            progressValue >= 100 ||
            Boolean(completedByStages))
        const status: 'running' | 'completed' | 'failed' = isFailed
          ? 'failed'
          : isCompleted
            ? 'completed'
            : 'running'

        setProgress(projectId, {
          progress: progressValue,
          stage: stageKey || undefined,
          message,
          status,
        })

        if (!isFailed) {
          lastProgressRef.current = progressValue
        }

        if (isFailed || isCompleted) {
          source.close()
        }
      } catch (error) {
        console.error('Failed to parse pipeline SSE payload', error)
      }
    }

    source.addEventListener('stage', handleEvent)
    source.addEventListener('message', handleEvent)

    source.onerror = (error) => {
      console.error('Pipeline SSE connection error', error)
    }

    return () => {
      source.removeEventListener('stage', handleEvent)
      source.removeEventListener('message', handleEvent)
      source.close()
      removeProgress(projectId)
    }
  }, [enabled, projectId, removeProgress, setProgress])

  return progressItem
}
