import { useState } from 'react'

import { Check } from 'lucide-react'

import { Label } from '@/shared/ui/Label'

export function VoiceAvatarUploader({
  avatarPreview,
  onPresetChange,
  disabled,
  helperText,
}: {
  avatarPreview: string | null
  onPresetChange: (presetId: string | null) => void
  disabled?: boolean
  helperText?: string
}) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isPresetLoading, setIsPresetLoading] = useState(false)

  const presetAvatars = [
    { id: 'default', src: '/avatars/default-avatar.png', label: '기본 1' },
    { id: 'male', src: '/avatars/default-avatar-male.png', label: '기본 2' },
    { id: 'female', src: '/avatars/default-avatar-female.png', label: '기본 3' },
  ]

  const handlePresetSelect = async (presetId: string, src: string) => {
    if (disabled) return
    setIsPresetLoading(true)
    setSelectedPreset(presetId)
    try {
      onPresetChange(presetId)
    } catch (error) {
      console.error('Failed to load preset avatar', error)
      setSelectedPreset(null)
    } finally {
      setIsPresetLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>아바타 이미지</Label>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {presetAvatars.map((preset) => {
            const isSelected = selectedPreset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  void handlePresetSelect(preset.id, preset.src)
                }}
                disabled={disabled || isPresetLoading}
                className={`relative rounded-full border p-1 transition ${
                  isSelected ? 'border-primary ring-2 ring-primary/60' : 'border-surface-4 hover:border-primary'
                } ${disabled ? 'opacity-50' : ''}`}
              >
                <div className="h-16 w-16 overflow-hidden rounded-full">
                  <img src={preset.src} alt={preset.label} className="h-full w-full object-cover" />
                </div>
                {isSelected && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="space-y-1 text-xs text-muted">
          <p>기본 아바타 중 하나를 선택하세요.</p>
        </div>
      </div>
    </div>
  )
}
