import type { Language } from '@/entities/language/types'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Label } from '@/shared/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { ValidationMessage } from '@/shared/ui/ValidationMessage'

type SourceLanguageFieldProps = {
  detectAutomatically: boolean
  replaceVoiceSamples: boolean
  onDetectChange: (checked: boolean) => void
  onReplaceVoiceSamplesChange: (checked: boolean) => void
  languages: Language[]
  sourceLanguage: string
  onSourceLanguageChange: (value: string) => void
  error?: string
}

export function SourceLanguageField({
  detectAutomatically,
  replaceVoiceSamples,
  onDetectChange,
  onReplaceVoiceSamplesChange,
  languages,
  sourceLanguage,
  onSourceLanguageChange,
  error,
}: SourceLanguageFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <Checkbox
            checked={detectAutomatically}
            onCheckedChange={(checked) => onDetectChange(Boolean(checked))}
          />
          원어 자동 인식 사용
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <Checkbox
            checked={replaceVoiceSamples}
            onCheckedChange={(checked) => onReplaceVoiceSamplesChange(Boolean(checked))}
          />
          음성샘플 자동 추천
        </label>
      </div>
      {!detectAutomatically ? (
        <div className="space-y-2">
          <Label className="sr-only" htmlFor="source-language">
            원어 선택
          </Label>
          <Select value={sourceLanguage} onValueChange={onSourceLanguageChange}>
            <SelectTrigger id="source-language">
              <SelectValue placeholder="원어를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.language_code} value={language.language_code}>
                  {language.name_ko}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ValidationMessage message={error} />
        </div>
      ) : null}
    </div>
  )
}
