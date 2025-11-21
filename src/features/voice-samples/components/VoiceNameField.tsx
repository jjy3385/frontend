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
      <Label htmlFor="voice-name">
        이름<span className="ml-1 text-danger">*</span>
      </Label>
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

