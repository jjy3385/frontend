import { Search, X } from 'lucide-react'

import { Input } from '@/shared/ui/Input'
import type { FilterChip } from '../hooks/useVoiceLibraryFilters'

interface VoiceSearchBarProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  chips?: FilterChip[]
  onResetChips?: () => void
}

export function VoiceSearchBar({
  value,
  onChange,
  placeholder = '제목, 설명, 태그 검색',
  chips = [],
  onResetChips,
}: VoiceSearchBarProps) {
  return (
    <div className="relative flex min-h-[2.75rem] flex-1 flex-wrap items-center gap-1.5 rounded-full border border-outline/50 bg-surface-1 px-3 py-1 shadow-soft focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 min-w-[120px] flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {chips.map((chip, idx) => (
        <span
          key={`${chip.label}-${chip.value}-${idx}`}
          className="bg-primary-container text-on-primary-container inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-semibold shadow-soft"
        >
          {chip.icon ? <span className="text-base">{chip.icon}</span> : null}
          <span className="whitespace-nowrap">
            {chip.label}: {chip.value}
          </span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="text-on-primary-container/80 hover:text-on-primary-container ml-0.5"
            aria-label={`${chip.label} 제거`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {(chips.length > 0 || value.trim()) && (
        <button
          type="button"
          onClick={() => {
            if (onResetChips) onResetChips()
            if (value) onChange('')
          }}
          className="text-muted-foreground hover:text-foreground ml-1 rounded-full p-1 transition-colors"
          aria-label="검색 및 필터 초기화"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
