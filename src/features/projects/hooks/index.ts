// Progress Hooks
export { useProjectProgressListener } from './useProjectProgressListener'
export type { UseProjectProgressListenerOptions } from './useProjectProgressListener'

// Global SSE Hook (unified SSE connection)
export { useGlobalSSE } from './useGlobalSSE'
export type { UseGlobalSSEOptions } from './useGlobalSSE'

// Re-export store hooks for convenience
export { useProjectProgressStore } from '../stores/useProjectProgressStore'
export { useSSEStore } from '../stores/useSSEStore'
export type { AudioGenerationEvent, AudioEventCallback } from '../stores/useSSEStore'

// Existing hooks (if any)
export * from './usePipelineStatusListener'
export * from './usePipelineStore'
export * from './useProjects'