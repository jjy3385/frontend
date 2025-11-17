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

const LOOP_MIN_PROGRESS = 1
const LOOP_MAX_PROGRESS = 100
const LOOP_INTERVAL_MS = 800
const loopProgressCache = new Map<string, number>()

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
  const [progressItem, setProgressItem] = useState<PipelineProgressItem>()
  const [loopProgress, setLoopProgress] = useState(() => {
    if (projectId) {
      return loopProgressCache.get(projectId) ?? LOOP_MIN_PROGRESS
    }
    return LOOP_MIN_PROGRESS
  })
  const loopProgressRef = useRef(loopProgress)

  useEffect(() => {
    loopProgressRef.current = loopProgress
  }, [loopProgress])

  useEffect(() => {
    if (!projectId) {
      loopProgressRef.current = LOOP_MIN_PROGRESS
      setLoopProgress(LOOP_MIN_PROGRESS)
      return
    }
    const cachedProgress = loopProgressCache.get(projectId) ?? LOOP_MIN_PROGRESS
    loopProgressRef.current = cachedProgress
    setLoopProgress(cachedProgress)
  }, [projectId])

  useEffect(() => {
    if (!projectId || !enabled) {
      setProgressItem(undefined)
      return
    }

    const url = `${env.apiBaseUrl}/api/pipeline/${projectId}/events`
    const source = new EventSource(url)

    const handleEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data as string) as PipelineEventPayload
        if (import.meta.env.DEV) {
          console.debug('[Pipeline SSE]', projectId, payload)
        }
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
        const progressValue = isFailed ? loopProgressRef.current : baseProgress
        const progressMessage = getProgressStageMessage(normalizedEventProgress)
        const baseMessage =
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
          status === 'completed' ? 100 : Math.min(Math.max(progressValue ?? 0, 0), 100)

        setProgressItem({
          progress: nextProgress,
          stage: stageKey || undefined,
          message,
          status,
        })

        if (projectId) {
          loopProgressCache.set(projectId, nextProgress)
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
      source.close()
      console.error('Pipeline SSE connection error', error)
    }

    return () => {
      source.removeEventListener('stage', handleEvent)
      source.removeEventListener('message', handleEvent)
      source.close()
      setProgressItem(undefined)
    }
  }, [enabled, projectId])

  useEffect(() => {
    if (!enabled) {
      loopProgressRef.current = LOOP_MIN_PROGRESS
      setLoopProgress(LOOP_MIN_PROGRESS)
      return
    }

    if (progressItem?.status && progressItem.status !== 'running') {
      const settledProgress =
        progressItem.progress ??
        (progressItem.status === 'completed' ? LOOP_MAX_PROGRESS : loopProgressRef.current)
      loopProgressRef.current = settledProgress
      setLoopProgress(settledProgress)
      return
    }

    const intervalId = window.setInterval(() => {
      setLoopProgress((prev) => {
        const next = prev >= LOOP_MAX_PROGRESS ? LOOP_MIN_PROGRESS : prev + 1
        loopProgressRef.current = next
        return next
      })
    }, LOOP_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [enabled, progressItem?.progress, progressItem?.status, projectId])

  if (!enabled) {
    return undefined
  }

  if (!progressItem) {
    return {
      progress: loopProgress,
      stage: undefined,
      message: undefined,
      status: 'running',
    }
  }

  const computedProgress =
    progressItem.status === 'running' ? loopProgress : (progressItem.progress ?? loopProgress)

  return {
    ...progressItem,
    progress: computedProgress,
  }
}
