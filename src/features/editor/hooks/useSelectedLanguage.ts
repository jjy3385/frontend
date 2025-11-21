import { useEffect, useRef, useState } from 'react'

import { useProject } from '@/features/projects/hooks/useProjects'
import { useProjectProgressStore } from '@/features/projects/stores/useProjectProgressStore'
import { useEditorStore } from '@/shared/store/useEditorStore'

import { useEditorLanguageSelection } from './useEditorLanguageSelection'

interface UseSelectedLanguageProps {
  projectId: string
}

/**
 * 에디터에서 선택된 언어 상태를 관리하는 훅
 *
 * - 프로젝트 데이터와 SSE 진행률을 기반으로 기본 언어 결정
 * - 완료된 첫 번째 타겟 언어를 자동 선택
 * - 완료된 타겟 언어가 없으면 '원본' 선택
 * - 사용자가 수동으로 선택한 언어는 유지
 */
export function useSelectedLanguage({ projectId }: UseSelectedLanguageProps) {
  const { data: project } = useProject(projectId)
  const sseProgress = useProjectProgressStore((state) => state.getProjectProgress(projectId))
  const setAudioPlaybackMode = useEditorStore((state) => state.setAudioPlaybackMode)

  // Determine default language based on completion status
  const { defaultLanguageCode } = useEditorLanguageSelection({
    project,
    sseProgress,
  })

  // Selected language state
  const [selectedLanguage, setSelectedLanguage] = useState<string>('original')
  const previousDefaultRef = useRef<string>('')

  useEffect(() => {
    // 세가지 충족 시에만 자동 업데이트:
    // 1. defaultLanguageCode(completed된 첫 타겟)가 있다
    // 2. defaultLanguageCode has changed from previous value
    // 3. User hasn't manually selected a different language (selectedLanguage matches previous default)
    if (
      defaultLanguageCode &&
      defaultLanguageCode !== previousDefaultRef.current &&
      (selectedLanguage === 'original' || selectedLanguage === previousDefaultRef.current)
    ) {
      setSelectedLanguage(defaultLanguageCode)
      setAudioPlaybackMode(defaultLanguageCode)
      previousDefaultRef.current = defaultLanguageCode
    }
  }, [defaultLanguageCode, selectedLanguage, setAudioPlaybackMode])

  return {
    selectedLanguage,
    setSelectedLanguage,
  }
}
