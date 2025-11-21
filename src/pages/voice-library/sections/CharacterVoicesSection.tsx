import type { VoiceSample } from '@/entities/voice-sample/types'

import { VoiceHighlightChip } from '../components/VoiceHighlightChip'

interface CharacterVoicesSectionProps {
  voices: VoiceSample[]
  onPlay: (sample: VoiceSample) => void
  playingSampleId: string | null
  onAddToMyVoices?: (sample: VoiceSample) => void
  onRemoveFromMyVoices?: (sample: VoiceSample) => void
  addingToMyVoices: Set<string>
  removingFromMyVoices: Set<string>
  showTitle?: boolean
}

export function CharacterVoicesSection({
  voices,
  onPlay,
  playingSampleId,
  onAddToMyVoices,
  onRemoveFromMyVoices,
  addingToMyVoices,
  removingFromMyVoices,
  showTitle = true,
}: CharacterVoicesSectionProps) {
  if (voices.length === 0) return null

  return (
    <section className="space-y-3">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">캐릭터 목소리</h2>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {voices.map((sample) => (
          <VoiceHighlightChip
            key={sample.id}
            sample={sample}
            onAddToMyVoices={onAddToMyVoices ? () => onAddToMyVoices(sample) : undefined}
            onRemoveFromMyVoices={
              onRemoveFromMyVoices ? () => onRemoveFromMyVoices(sample) : undefined
            }
            isAdding={onAddToMyVoices ? addingToMyVoices.has(sample.id) : false}
            isRemoving={onRemoveFromMyVoices ? removingFromMyVoices.has(sample.id) : false}
            isInMyVoices={sample.isInMyVoices ?? false}
            onPlay={onPlay}
            isPlaying={playingSampleId === sample.id}
          />
        ))}
      </div>
    </section>
  )
}
