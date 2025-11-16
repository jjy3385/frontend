import { create } from 'zustand'

export type PipelineProgressItem = {
  progress: number
  stage?: string
  message?: string
  status?: 'running' | 'completed' | 'failed'
  updatedAt: number
}

type PipelineProgressState = {
  items: Record<string, PipelineProgressItem>
  setProgress: (projectId: string, data: Omit<PipelineProgressItem, 'updatedAt'>) => void
  removeProgress: (projectId: string) => void
  clear: () => void
}

export const usePipelineProgressStore = create<PipelineProgressState>((set) => ({
  items: {},
  setProgress: (projectId, data) =>
    set((state) => ({
      items: {
        ...state.items,
        [projectId]: {
          progress: data.progress,
          stage: data.stage,
          message: data.message,
          status: data.status,
          updatedAt: Date.now(),
        },
      },
    })),
  removeProgress: (projectId) =>
    set((state) => {
      if (!state.items[projectId]) {
        return state
      }
      const next = { ...state.items }
      delete next[projectId]
      return { items: next }
    }),
  clear: () => set({ items: {} }),
}))
