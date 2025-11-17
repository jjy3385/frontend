import { useEffect, useRef, useState } from 'react'

import { env } from '@/shared/config/env'

export type PipelineProgressItem = {
  progress: number
  stage?: string
  message?: string
  status: 'running' | 'completed' | 'failed'
}

type PipelineStage = {
  id: string
  status?: string
  progress?: number | string
}

type PipelineEventPayload = {
  current_stage?: string
  stage?: string
  type?: string
  status?: string
  overall_progress?: number | string
  progress?: number | string
  stages?: PipelineStage[]
  message?: string
  error?: string
  process?: string
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
  sync_started: '결과 동기화 중',
  sync_completed: '결과 동기화 완료',
  mux_started: '비디오 합성 중',
  mux_completed: '비디오 합성 완료',
  done: '처리가 완료되었습니다.',
}

const progressMessageMap: Record<number, string> = {
  1: '전처리 중',
  10: '전처리 중',
  20: '텍스트 추출 중',
  21: '텍스트 추출 중',
  35: '텍스트 추출 중',
  36: '번역 중',
  70: '번역 중',
  71: '번역 중',
  100: '번역 중',
}

const DEFAULT_PROGRESS = 0
const progressCache = new Map<string, number>()

const getProgressStageMessage = (progress?: number) => {
  if (progress == null) return undefined
  const rounded = Math.round(progress)
  return progressMessageMap[rounded]
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
  const normalizedStage =
    normalizeProgress(payload.stages?.find((s) => s.id === stage)?.progress) ?? 0
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

export function usePipelineProgress(
  projectId?: string,
  enabled = true,
): PipelineProgressItem | undefined {
  const initialCachedProgress = projectId ? progressCache.get(projectId) : undefined
  const [progressItem, setProgressItem] = useState<PipelineProgressItem | undefined>(() =>
    initialCachedProgress !== undefined
      ? {
          progress: initialCachedProgress,
          stage: undefined,
          message: undefined,
          status: 'running',
        }
      : undefined,
  )
  const lastProgressRef = useRef(initialCachedProgress ?? DEFAULT_PROGRESS)

  useEffect(() => {
    if (typeof progressItem?.progress === 'number' && Number.isFinite(progressItem.progress)) {
      lastProgressRef.current = progressItem.progress
    }
  }, [progressItem?.progress])

  useEffect(() => {
    if (!projectId) {
      lastProgressRef.current = DEFAULT_PROGRESS
      setProgressItem(undefined)
      return
    }
    const cachedProgress = progressCache.get(projectId)
    lastProgressRef.current = cachedProgress ?? DEFAULT_PROGRESS
    if (cachedProgress === undefined) {
      setProgressItem(undefined)
      return
    }
    setProgressItem({
      progress: cachedProgress,
      stage: undefined,
      message: undefined,
      status: 'running',
    })
  }, [projectId])

  useEffect(() => {
    if (!projectId || !enabled) {
      setProgressItem(undefined)
      lastProgressRef.current = DEFAULT_PROGRESS
      return
    }

    const url = `${env.apiBaseUrl}/api/pipeline/${projectId}/events`
    const source = new EventSource(url)

    const handleEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data as string) as PipelineEventPayload
        const normalizedEventProgress = normalizeProgress(payload.progress)
        const stageKey = (payload.current_stage ?? payload.stage ?? '').toLowerCase()
        const failureStage =
          payload.status === 'failed'
            ? stageKey
            : payload.stages
                ?.find((stage) => (stage.status ?? '').toLowerCase() === 'failed')
                ?.id?.toLowerCase()
        const isFailed = Boolean(failureStage)
        const baseProgress =
          normalizedEventProgress !== undefined
            ? normalizedEventProgress
            : computeOverallProgress(payload)
        const safeBaseProgress =
          typeof baseProgress === 'number' && Number.isFinite(baseProgress)
            ? baseProgress
            : lastProgressRef.current
        const progressValue = isFailed ? lastProgressRef.current : safeBaseProgress
        const progressMessage = getProgressStageMessage(normalizedEventProgress)
        const baseMessage =
          payload.process ??
          progressMessage ??
          payload.message ??
          stageLabelMap[failureStage ?? stageKey] ??
          failureStage ??
          (stageKey || '처리 중')
        const message = isFailed ? `${baseMessage} 실패` : baseMessage
        const completedByStages =
          payload.stages?.length &&
          payload.stages.every((stage) => (stage.status ?? '').toLowerCase() === 'completed')
        const isCompleted =
          !isFailed &&
          (stageKey === 'done' ||
            payload.status === 'done' ||
            payload.status === 'completed' ||
            (progressValue ?? 0) >= 100 ||
            Boolean(completedByStages))

        const status: 'running' | 'completed' | 'failed' = isFailed
          ? 'failed'
          : isCompleted
            ? 'completed'
            : 'running'
        const nextProgress =
          status === 'completed'
            ? 100
            : Math.min(Math.max(progressValue ?? DEFAULT_PROGRESS, 0), 100)

        lastProgressRef.current = nextProgress
        setProgressItem({
          progress: nextProgress,
          stage: stageKey || undefined,
          message,
          status,
        })

        if (projectId) {
          progressCache.set(projectId, nextProgress)
        }

        if (isFailed || isCompleted) {
          source.close()
        }
      } catch (error) {
        console.error('Failed to parse pipeline SSE payload', error)
      }
    }

    const handleProcessEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data as string) as PipelineEventPayload
        if (import.meta.env.DEV) {
          console.debug('[Pipeline SSE:process]', projectId, payload)
        }

        const normalizedProcessProgress = normalizeProgress(payload.progress)
        const stageKey = (payload.current_stage ?? payload.stage ?? '').toLowerCase()
        const baseMessage =
          payload.process ??
          payload.message ??
          getProgressStageMessage(normalizedProcessProgress) ??
          stageLabelMap[stageKey] ??
          (stageKey || '처리 중')

        if (normalizedProcessProgress === undefined && !payload.process && !payload.message) {
          return
        }

        setProgressItem((prev) => {
          if (prev && prev.status !== 'running') {
            return prev
          }

          const resolvedStage = stageKey || prev?.stage
          const previousProgress =
            typeof prev?.progress === 'number' && Number.isFinite(prev.progress)
              ? prev.progress
              : lastProgressRef.current
          const resolvedProgress =
            normalizedProcessProgress !== undefined
              ? Math.min(Math.max(normalizedProcessProgress, 0), 100)
              : previousProgress

          lastProgressRef.current = resolvedProgress
          if (projectId) {
            progressCache.set(projectId, resolvedProgress)
          }

          return {
            progress: resolvedProgress,
            stage: resolvedStage,
            message: baseMessage,
            status: 'running',
          }
        })
      } catch (error) {
        console.error('Failed to parse pipeline SSE process payload', error)
      }
    }

    source.addEventListener('stage', handleEvent)
    source.addEventListener('message', handleEvent)
    source.addEventListener('process', handleProcessEvent)

    source.onerror = (error) => {
      source.close()
      console.error('Pipeline SSE connection error', error)
    }

    return () => {
      source.removeEventListener('stage', handleEvent)
      source.removeEventListener('message', handleEvent)
      source.removeEventListener('process', handleProcessEvent)
      source.close()
      setProgressItem(undefined)
    }
  }, [enabled, projectId])

  if (!enabled) {
    return undefined
  }

  if (progressItem) {
    return progressItem
  }

  if (projectId) {
    return {
      progress: progressCache.get(projectId) ?? DEFAULT_PROGRESS,
      stage: undefined,
      message: undefined,
      status: 'running',
    }
  }

  return undefined
}
