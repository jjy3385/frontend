import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/Input'

interface VoiceSearchBarProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
}

export function VoiceSearchBar({ value, onChange, placeholder = '제목, 설명, 태그 검색' }: VoiceSearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-full border-surface-3 bg-surface-1 py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
