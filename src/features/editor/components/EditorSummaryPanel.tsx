import type { EditorSegment } from '@/features/editor/types/editor'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '@/shared/ui/Tabs'

import { SummaryWorkspace } from './SummaryWorkspace'
import { TranslationSummarySection } from './TranslationSummarySection'

interface EditorSummaryPanelProps {
  projectId: string
  segments: EditorSegment[]
  duration: number
  sourceLanguage: string
  targetLanguage: string
  summaryPaneRatio: number
}

/**
 * 에디터 우측 패널 - 요약/번역 탭
 *
 * - 요약 탭: 세그먼트 요약 워크스페이스
 * - 번역 탭: 번역 요약 섹션
 */
export function EditorSummaryPanel({
  projectId,
  segments,
  duration,
  sourceLanguage,
  targetLanguage,
  summaryPaneRatio,
}: EditorSummaryPanelProps) {
  return (
    <div
      className="shrink-0 overflow-hidden border border-b-0 border-l-0 border-surface-3 bg-surface-1 shadow-sm"
      style={{ flexBasis: `${summaryPaneRatio * 100}%` }}
    >
      <TabsRoot defaultValue="summary" className="flex h-full flex-col">
        <div className="border-b border-surface-3 px-3">
          <TabsList className="h-auto gap-0 rounded-none border-0 bg-transparent p-0">
            <TabsTrigger
              value="summary"
              className="data-[state=active]:text-balck data-[state=active]:bg-tran rounded-none border-primary px-4 py-2 text-xs font-semibold data-[state=active]:border-b-2"
            >
              요약
            </TabsTrigger>
            <TabsTrigger
              value="translation"
              className="data-[state=active]:text-balck data-[state=active]:bg-tran rounded-none border-primary px-4 py-2 text-xs font-semibold data-[state=active]:border-b-2"
            >
              번역
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary" className="mt-0 flex-1 overflow-hidden">
          <SummaryWorkspace projectId={projectId} segments={segments} duration={duration} />
        </TabsContent>

        <TabsContent value="translation" className="mt-0 flex-1 overflow-hidden">
          <TranslationSummarySection
            projectId={projectId}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        </TabsContent>
      </TabsRoot>
    </div>
  )
}
