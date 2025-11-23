import { Label } from '@/shared/ui/Label'

type Props = {
  licenseCode: string
  isPublic: boolean
  disabled?: boolean
  onLicenseChange: (value: string) => void
  onPublicToggle: (checked: boolean) => void
}

export function VoiceVisibilityAndLicense({
  licenseCode,
  isPublic,
  disabled,
  onLicenseChange,
  onPublicToggle,
}: Props) {
  return (
    <div className="grid gap-4 rounded-xl bg-surface-1 p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="license-code">라이선스</Label>
        <select
          id="license-code"
          value={licenseCode}
          onChange={(e) => onLicenseChange(e.target.value)}
          className="w-full rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm"
          disabled={disabled}
        >
          <option value="commercial">상업적 사용 허용</option>
          <option value="noncommercial">비상업용(상업 사용 불가)</option>
        </select>
        <p className="text-xs text-muted-foreground">
          에피소드(유튜브 배포 등)에서는 상업적 사용이 기본이므로 비상업 라이선스는 사용이 제한됩니다.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="is-public">공개 여부</Label>
        <div className="flex items-center gap-3 rounded-lg border border-surface-3 bg-surface-1 px-3 py-2">
          <input
            id="is-public"
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={isPublic}
            onChange={(e) => onPublicToggle(e.target.checked)}
            disabled={disabled}
          />
          <div className="text-sm leading-tight">
            <div className="font-medium">공개</div>
            <div className="text-xs text-muted-foreground">
              공개 시 이후 삭제가 불가합니다. AI 학습 또는 타 사용자에게 노출될 수 있습니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
