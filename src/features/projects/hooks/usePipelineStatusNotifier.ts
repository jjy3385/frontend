import { useEffect, useRef } from 'react'
import { usePipelineProgress } from './usePipelineProgress'
import { useUiStore } from '@/shared/store/useUiStore'

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
        description: `${projectTitle} 처리가 완료되었습니다.`,
        autoDismiss: 4000,
      })
    }

    prevStatus.current = current
  }, [pipelineProgress?.status, projectId, showToast])
}
