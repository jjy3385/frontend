import { Upload, Video } from 'lucide-react'

import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Button } from '@/shared/ui/Button'

import { LanguageSelector } from './LanguageSelector'
import { SaveIndicator } from './SaveIndicator'

interface EditorHeaderProps {
  projectId: string
  selectedLanguage: string
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  hasChanges: boolean
  isMuxing: boolean
  isLoading: boolean
  onLanguageChange: (languageCode: string) => void
  onExportClick: () => void
  onMuxClick: () => void
}

/**
 * 에디터 상단 헤더
 *
 * - Breadcrumbs
 * - Save indicator
 * - Export/Mux 버튼
 * - 언어 선택기
 */
export function EditorHeader({
  projectId,
  selectedLanguage,
  saveStatus,
  hasChanges,
  isMuxing,
  isLoading,
  onLanguageChange,
  onExportClick,
  onMuxClick,
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b-[3px] border-neutral-200 px-2 py-2">
      <div className="text-xs">
        <Breadcrumbs
          items={[
            { label: '홈', href: '/' },
            { label: `에피소드`, href: `/projects/${projectId}` },
            { label: '에디터' },
          ]}
          className="opacity-50"
        />
      </div>
      <div className="flex items-center gap-4">
        <SaveIndicator status={saveStatus} hasChanges={hasChanges} />
        <div className="flex items-center gap-3">
          <Button type="button" onClick={onExportClick} className="h-9">
            <Upload className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onMuxClick}
            disabled={isMuxing || isLoading}
          >
            <Video className="h-4 w-4" />
            {isMuxing ? 'Mux 중...' : 'Mux'}
          </Button>
          <LanguageSelector
            projectId={projectId}
            currentLanguageCode={selectedLanguage}
            onLanguageChange={onLanguageChange}
          />
        </div>
      </div>
    </div>
  )
}
