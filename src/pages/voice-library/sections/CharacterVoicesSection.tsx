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
  currentUserId?: string
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
  currentUserId,
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
        {voices.map((sample) => {
          const isOwner =
            currentUserId && sample.owner_id
              ? String(currentUserId) === String(sample.owner_id)
              : false

          return (
            <VoiceHighlightChip
              key={sample.id}
              sample={sample}
              onAddToMyVoices={
                isOwner ? undefined : onAddToMyVoices ? () => onAddToMyVoices(sample) : undefined
              }
              onRemoveFromMyVoices={
                isOwner
                  ? undefined
                  : onRemoveFromMyVoices
                    ? () => onRemoveFromMyVoices(sample)
                    : undefined
              }
              isAdding={isOwner ? false : onAddToMyVoices ? addingToMyVoices.has(sample.id) : false}
              isRemoving={
                isOwner ? false : onRemoveFromMyVoices ? removingFromMyVoices.has(sample.id) : false
              }
              isInMyVoices={sample.isInMyVoices ?? false}
              isOwner={isOwner}
              onPlay={onPlay}
              isPlaying={playingSampleId === sample.id}
            />
          )
        })}
      </div>
    </section>
  )
}
