export type AttributeKey = 'accent' | 'gender' | 'age'

export const DEFAULT_AVATAR = '/avatars/default-avatar.png'
export const PRESET_AVATAR_MAP: Record<string, string> = {
  default: '/avatars/default-avatar.png',
  default_avatar: '/avatars/default-avatar.png', // backward compatibility
  male: '/avatars/default-avatar-male.png',
  female: '/avatars/default-avatar-female.png',
}

const languageCountryMap: Record<string, string> = {
  ko: 'KR',
  en: 'US',
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

export const getCountryCode = (code?: string) => {
  if (!code) return 'US'
  const normalized = code.toLowerCase()
  return languageCountryMap[normalized] ?? normalized.slice(0, 2).toUpperCase()
}

export const getPresetAvatarUrl = (preset?: string | null) => {
  if (!preset) return DEFAULT_AVATAR
  return PRESET_AVATAR_MAP[preset] ?? DEFAULT_AVATAR
}

