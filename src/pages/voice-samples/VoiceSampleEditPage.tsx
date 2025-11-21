import { useEffect, useMemo, useState } from 'react'

import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { VoiceSample } from '@/entities/voice-sample/types'
import { fetchVoiceSample, updateVoiceSample } from '@/features/voice-samples/api/voiceSamplesApi'
import { useLanguage } from '@/features/languages/hooks/useLanguage'
import { queryKeys } from '@/shared/config/queryKeys'
import { routes } from '@/shared/config/routes'
import {
  VoiceAvatarUploader,
  VoiceCategorySelector,
  VoiceDescriptionField,
  VoiceNameField,
  VoiceTagsField,
  VoiceLanguageField,
} from '@/features/voice-samples/components'
import { getPresetAvatarUrl } from '@/features/voice-samples/components/voiceSampleFieldUtils'
import { VoiceCloningLayout } from '@/pages/voice-cloning/components/VoiceCloningLayout'
import { Button } from '@/shared/ui/Button'
import { Link } from 'react-router-dom'

export default function VoiceSampleEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const stateSample = (location.state as { sample?: VoiceSample } | undefined)?.sample

  const { data: sampleFromApi, isLoading } = useQuery({
    queryKey: queryKeys.voiceSamples.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('샘플 ID가 없습니다.')
      return fetchVoiceSample(id)
    },
    enabled: Boolean(id),
    initialData: stateSample,
  })

  const sample = sampleFromApi

  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [languageCode, setLanguageCode] = useState('ko')
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [avatarPreset, setAvatarPreset] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: languageResponse } = useLanguage()
  const languageOptions = useMemo(() => languageResponse ?? [], [languageResponse])

  useEffect(() => {
    if (!sample) return
    setName(sample.name ?? '')
    setNotes(sample.description ?? '')
    setLanguageCode(sample.country ?? 'ko')
    setCategories(sample.category ?? [])
    setTags(sample.tags ?? [])
    setAvatarPreset(sample.avatarPreset ?? null)
    setAvatarPreview(getPresetAvatarUrl(sample.avatarPreset) ?? sample.avatarImageUrl ?? null)
  }, [sample])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id || !name.trim()) return
    try {
      setIsSubmitting(true)
      await updateVoiceSample(id, {
        name: name.trim(),
        description: notes.trim() || undefined,
        country: languageCode,
        category: categories.length > 0 ? categories : undefined,
        tags: tags.length > 0 ? tags : undefined,
        avatar_preset: avatarPreset ?? undefined,
      })
      void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
      queryClient.setQueryData(queryKeys.voiceSamples.detail(id), (prev: VoiceSample | undefined) =>
        prev
          ? {
              ...prev,
              name,
              description: notes,
              country: languageCode,
              category: categories.length > 0 ? categories : undefined,
              tags: tags.length > 0 ? tags : undefined,
              avatarPreset: avatarPreset ?? undefined,
              avatarImageUrl: getPresetAvatarUrl(avatarPreset) ?? prev.avatarImageUrl,
            }
          : prev,
      )
      navigate(routes.voiceLibrary)
    } catch (error) {
      console.error('음성 샘플 수정 실패:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        음성 정보를 불러오는 중...
      </div>
    )
  }

  if (!sample) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        음성 정보를 찾을 수 없습니다.
      </div>
    )
  }

  return (
    <VoiceCloningLayout
      title="Voice Sample"
      subtitle="음성 샘플 수정"
      description="음성 등록 폼과 동일한 레이아웃으로 모든 필드를 수정할 수 있습니다."
      step="details"
    >
      <div className="p-8 sm:p-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">세부 정보 입력</h2>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={isSubmitting}>
            뒤로
          </Button>
        </div>
        <form
          onSubmit={(e) => {
            void handleSubmit(e)
          }}
          className="space-y-6"
        >
          <VoiceNameField name={name} onChange={setName} disabled={isSubmitting} />
          <VoiceLanguageField
            value={languageCode}
            onChange={setLanguageCode}
            options={languageOptions}
            disabled={isSubmitting}
          />

          <VoiceCategorySelector selected={categories} onChange={setCategories} disabled={isSubmitting} />
          <VoiceTagsField tags={tags} onChange={setTags} disabled={isSubmitting} />

          <VoiceAvatarUploader
            avatarPreview={avatarPreview}
            onPresetChange={(preset) => {
              setAvatarPreset(preset)
              setAvatarPreview(getPresetAvatarUrl(preset) ?? null)
            }}
            disabled={isSubmitting}
            helperText="512x512 이하 PNG/JPG 권장, 미선택 시 기존 또는 기본 이미지가 사용됩니다."
          />

          <VoiceDescriptionField value={notes} onChange={setNotes} disabled={isSubmitting} />
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-surface-4 text-primary focus:ring-accent"
              defaultChecked
              readOnly
            />
            <div className="space-y-1 text-sm leading-relaxed text-muted">
              <p>
                음성 파일을 업로드함으로써 필요한 권리와 동의를 모두 확보했으며, 생성된 콘텐츠를 불법적이거나
                부정한 목적으로 사용하지 않겠다는 점에 동의합니다. 실제 서비스와 동일한 수준의 정책을 참고용으로
                제공합니다.
              </p>
              <div className="flex flex-wrap gap-3 text-primary underline underline-offset-4">
                <Link to={routes.termsOfService}>이용약관</Link>
                <Link to={routes.prohibitedPolicy}>금지 콘텐츠 및 사용 정책</Link>
                <Link to={routes.privacyPolicy}>개인정보 처리방침</Link>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      </div>
    </VoiceCloningLayout>
  )
}
