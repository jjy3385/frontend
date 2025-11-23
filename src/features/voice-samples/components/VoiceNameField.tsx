import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'

export function VoiceNameField({
  name,
  onChange,
  disabled,
}: {
  name: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="voice-name" className="font-semibold">
          이름
        </Label>
        <span className="bg-primary-container text-on-primary-container inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none">
          필수
        </span>
      </div>
      <Input
        id="voice-name"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="이름"
        required
        disabled={disabled}
      />
    </div>
  )
}

