import { useEffect, useRef } from 'react'

import { useUiStore } from '@/shared/store/useUiStore'

import { usePipelineProgress } from './usePipelineProgress'

export function usePipelineStatusNotifier(
  projectId: string | undefined,
  enabled: boolean,
  projectTitle?: string,
) {
  const pipelineProgress = usePipelineProgress(projectId, enabled)
  const showToast = useUiStore((state) => state.showToast)
  const prevStatus = useRef(pipelineProgress?.status)

  useEffect(() => {
    const prev = prevStatus.current
    const current = pipelineProgress?.status

    if (prev !== 'completed' && current === 'completed') {
      showToast({
        id: `pipeline-completed-${projectId}`,
        title: '영상 처리가 완료',
        description: `${projectTitle ?? '프로젝트'}의 파이프라인 처리가 완료되었습니다.`,
        autoDismiss: 4000,
      })
    }

    prevStatus.current = current
  }, [pipelineProgress?.status, projectId, projectTitle, showToast])
}
