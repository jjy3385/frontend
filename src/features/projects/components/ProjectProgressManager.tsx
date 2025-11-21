import { useGlobalSSE } from '../hooks/useGlobalSSE'

/**
 * 전역 SSE 연결 관리 컴포넌트
 *
 * 단일 SSE 연결로 모든 이벤트 타입을 처리:
 * - target-progress: 타겟 언어 파이프라인 진행률
 * - project-progress: 프로젝트 전체 진행률
 * - audio-completed/failed: 오디오 생성 완료/실패 (useSSEStore를 통해 구독자에게 전달)
 *
 * @example
 * // AppProviders.tsx에서 사용:
 * <QueryClientProvider client={queryClient}>
 *   <ProjectProgressManager />
 *   {children}
 * </QueryClientProvider>
 */
export function ProjectProgressManager() {
  // 전역 SSE 연결 - 모든 프로젝트의 이벤트 구독
  useGlobalSSE({
    // 타겟 언어 작업 완료 시 추가 처리
    onTargetComplete: (projectId, targetLang) => {
      console.log(`[GlobalSSE] Target completed: ${projectId} - ${targetLang}`)
    },
    // 프로젝트 전체 완료 시 추가 처리
    onProjectComplete: (projectId) => {
      console.log(`[GlobalSSE] Project completed: ${projectId}`)
    },
  })

  // 이 컴포넌트는 UI를 렌더링하지 않고 백그라운드에서만 동작
  return null
}
