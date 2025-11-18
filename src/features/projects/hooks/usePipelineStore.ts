import { create } from 'zustand'
import type { PipelineProgressItem } from './usePipelineProgress'

type PipelineMap = Record<string, PipelineProgressItem>
interface PipelineStore {
  items: PipelineMap
  upsert: (projectId: string, payload: PipelineProgressItem) => void
  clear: (projectId: string) => void
}
export const usePipelineStore = create<PipelineStore>((set) => ({
  items: {},
  upsert: (projectId, item) => set((state) => ({ items: { ...state.items, [projectId]: item } })),
  clear: (projectId) =>
    set((state) => {
      const next = { ...state.items }
      delete next[projectId]
      return { items: next }
    }),
}))
