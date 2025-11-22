import { useMemo } from 'react'

import type { ProjectDetail } from '@/entities/project/types'
import type { ProjectProgress } from '@/features/projects/types/progress'

export interface LanguageOption {
  code: string
  label: string
  isOriginal: boolean
  isAvailable: boolean // 선택 가능 여부 (파이프라인 완료 여부)
  status: 'pending' | 'processing' | 'completed' | 'failed' | null
  progress: number
}

interface UseEditorLanguageSelectionProps {
  project: ProjectDetail | undefined
  sseProgress: ProjectProgress | undefined
}

/**
 * 에디터 언어 선택 로직
 *
 * - 완료된 첫 번째 번역 언어를 기본값으로 선택
 * - 모든 언어가 미완료면 원어 선택
 * - SSE 진행률에 따라 언어 활성화 상태 업데이트
 */
export function useEditorLanguageSelection({
  project,
  sseProgress,
}: UseEditorLanguageSelectionProps) {
  const languageOptions = useMemo<LanguageOption[]>(() => {
    if (!project) return []

    // 원어 옵션
    const originalOption: LanguageOption = {
      code: 'original',
      label: project.source_language || '원어',
      isOriginal: true,
      isAvailable: true, // 원어는 항상 선택 가능
      status: null,
      progress: 100,
    }

    // 번역 언어 옵션들
    const targetOptions: LanguageOption[] =
      project.targets?.map((target) => {
        // SSE 진행률이 있으면 사용, 없으면 API 데이터 사용
        const sseTarget = sseProgress?.targets[target.language_code]
        const status = sseTarget?.status ?? target.status
        const progress = sseTarget?.progress ?? target.progress

        // 완료된 언어만 선택 가능
        const isAvailable = status === 'completed'

        return {
          code: target.language_code,
          label: target.language_code.toUpperCase(),
          isOriginal: false,
          isAvailable,
          status,
          progress,
        }
      }) || []

    return [originalOption, ...targetOptions]
  }, [project, sseProgress])

  // 기본 선택 언어: 완료된 첫 번째 번역 언어, 없으면 원어
  const defaultLanguageCode = useMemo(() => {
    const firstAvailableTarget = languageOptions.find(
      (option) => !option.isOriginal && option.isAvailable,
    )

    return firstAvailableTarget?.code ?? 'original'
  }, [languageOptions])

  // 선택 가능한 언어가 있는지 확인
  const hasAvailableTargets = languageOptions.some(
    (option) => !option.isOriginal && option.isAvailable,
  )

  return {
    languageOptions,
    defaultLanguageCode,
    hasAvailableTargets,
  }
}
