import { useEffect } from 'react'
import { usePipelineStore } from './usePipelineStore'
import type { ProjectStatus, ProjectSummary } from '@/entities/project/types'
import { env } from '@/shared/config/env'

const pipelineTrackStatuses = new Set<ProjectStatus>(['uploading', 'processing', 'uploaded'])
const shouldTrack = (status?: ProjectStatus) =>
  pipelineTrackStatuses.has(status ?? ('' as ProjectStatus))

export type PipelineProgressItem = {
  progress: number
  stage?: string
  message?: string
  status: 'running' | 'completed' | 'failed'
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

type PipelineStageStatus = 'running' | 'completed' | 'failed'
type PipelineEventPayload = {
  current_stage?: string
  stage?: string
  status?: string
  overall_progress?: number | string
  progress?: number | string
  stages?: { id: string; status?: string; progress?: number | string }[]
  message?: string
  process?: string
}

const transformToProgressItem = (payload: PipelineEventPayload): PipelineProgressItem => {
  // usePipelineProgress.ts 에 있는 normalize/compute 함수들을 그대로 옮겨와서 재사용
  const normalizedProgress = normalizeProgress(payload.progress) ?? computeOverallProgress(payload)
  const stageKey = (payload.current_stage ?? payload.stage ?? '').toLowerCase()
  const message =
    payload.process ??
    payload.message ??
    stageLabelMap[stageKey] ??
    (stageKey ? `${stageKey} 진행 중` : '처리 중')

  const status: PipelineStageStatus =
    payload.status === 'failed'
      ? 'failed'
      : payload.status === 'completed' || payload.status === 'done' || normalizedProgress >= 100
        ? 'completed'
        : 'running'

  return {
    progress: Math.min(Math.max(normalizedProgress ?? 0, 0), 100),
    stage: stageKey || undefined,
    message,
    status,
  }
}

export function PipelineStatusListener({ project }: { project: ProjectSummary }) {
  useEffect(() => {
    if (!shouldTrack(project.status)) return
    const source = new EventSource(`${env.apiBaseUrl}/api/pipeline/${project.id}/events`)
    const handleEvent = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as PipelineEventPayload
      const item = transformToProgressItem(payload)
      usePipelineStore.getState().upsert(project.id, item)
    }
    source.addEventListener('stage', handleEvent)
    source.addEventListener('message', handleEvent)
    return () => {
      source.close()
      usePipelineStore.getState().clear(project.id)
    }
  }, [project.id, project.status])
  return null
}
