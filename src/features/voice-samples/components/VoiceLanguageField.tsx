import ReactCountryFlag from 'react-country-flag'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'

type LanguageOption = {
  language_code: string
  name_ko?: string
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  ko: 'KR',
  kr: 'KR',
  en: 'US',
  us: 'US',
  uk: 'GB',
  gb: 'GB',
  ja: 'JP',
  jp: 'JP',
  zh: 'CN',
  cn: 'CN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  ru: 'RU',
}

export function VoiceLanguageField({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string
  onChange: (next: string) => void
  options: LanguageOption[]
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <label>
        언어<span className="ml-1 text-danger">*</span>
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="언어를 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {options.map((lang) => {
            const code = lang.language_code
            const cc = COUNTRY_CODE_MAP[code.toLowerCase()] ?? code.slice(0, 2).toUpperCase()
            const label = lang.name_ko ?? code
            return (
              <SelectItem key={code} value={code}>
                <div className="flex items-center gap-2">
                  <ReactCountryFlag
                    countryCode={cc}
                    svg
                    style={{ width: '1em', height: '1em' }}
                  />
                  {label}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
