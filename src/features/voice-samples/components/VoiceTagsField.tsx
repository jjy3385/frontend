import { useState } from 'react'

import { X } from 'lucide-react'

interface VoiceTagsFieldProps {
  tags: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
  label?: string
  placeholder?: string
}

export function VoiceTagsField({
  tags,
  onChange,
  disabled = false,
  label = '태그',
  placeholder = 'SNS 해시태그처럼 자유롭게 적어주세요. (예: #차분한 #신나는)',
}: VoiceTagsFieldProps) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const next = input.trim()
    if (!next) return
    if (tags.includes(next)) {
      setInput('')
      return
    }
    onChange([...tags, next])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAdd()
    }
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-surface-3 bg-surface-1 p-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 text-xs text-foreground"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="flex h-4 w-4 items-center justify-center rounded-full text-muted hover:text-foreground"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAdd}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 min-w-[160px] border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        원하는 용도를 여러 개 선택하면 검색 시 더 잘 노출됩니다.
      </p>
    </div>
  )
}
import { Label } from '@/shared/ui/Label'
