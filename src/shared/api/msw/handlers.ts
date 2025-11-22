import { HttpResponse, http, passthrough } from 'msw'

import type { ExampleItem, ExampleItemPayload } from '../../../entities/example/types'
import { sampleGlossaries } from '../../../entities/glossary/types'
import { sampleProjects } from '../../../entities/project/types'
import { sampleSegments } from '../../../entities/segment/types'
import { sampleVoices } from '../../../entities/voice-sample/types'

let exampleItems: ExampleItem[] = [
  {
    id: 'example-1',
    name: 'Sample Onboarding Flow',
    owner: 'Evelyn',
    status: 'in-progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'example-2',
    name: 'Dubbing Guide Documentation',
    owner: 'Marcus',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockUser = {
  id: 'jjy3386',
  _id: 'jjy3386',
  email: 'jjy3386@gmail.com',
  name: '진주영',
  roles: ['editor'],
}

// ---- Mock credits / voice library state ----
let creditBalance = 5000
const creditPackages = [
  { id: 'pack-starter', label: '스타터 1,000', credits: 1000, priceKRW: 9900, bonusCredits: 0 },
  { id: 'pack-pro', label: '프로 5,000', credits: 5000, priceKRW: 44900, bonusCredits: 250 },
  { id: 'pack-team', label: '팀 10,000', credits: 10000, priceKRW: 84900, bonusCredits: 1000 },
  { id: 'pack-elite', label: '엘리트 20,000', credits: 20000, priceKRW: 159900, bonusCredits: 2500 },
]

type VoiceSampleMock = {
  _id: string
  owner_id: string
  name: string
  description?: string
  is_public: boolean
  file_path_wav: string
  audio_sample_url?: string | null
  prompt_text?: string | null
  created_at: string
  is_in_my_voices: boolean
  added_count: number
  category?: string[] | string | null
  is_builtin: boolean
  country?: string | null
  gender?: string | null
  avatar_image_url?: string | null
  avatar_image_path?: string | null
  avatar_preset?: string | null
  age?: string | null
  accent?: string | null
  tags?: string[] | null
  can_commercial_use?: boolean
  license_code?: string
}

const mockVoiceSamples: VoiceSampleMock[] = [
  {
    _id: 'voice-amy',
    owner_id: 'owner-1',
    name: 'Amy (KR)',
    description: '따뜻한 한국어 여성 보이스',
    is_public: true,
    file_path_wav: '/mock/amy.wav',
    audio_sample_url: '/assets/sample-voice-amy.mp3',
    created_at: new Date().toISOString(),
    is_in_my_voices: false,
    added_count: 1200,
    category: ['character'],
    is_builtin: false,
    country: 'KR',
    gender: 'female',
    avatar_image_url: undefined,
    avatar_preset: 'default',
    tags: ['korean', 'warm'],
    can_commercial_use: true,
    license_code: 'commercial',
  },
  {
    _id: 'voice-hiro',
    owner_id: 'owner-2',
    name: 'Hiro (JP)',
    description: '차분한 일본어 남성 보이스',
    is_public: true,
    file_path_wav: '/mock/hiro.wav',
    audio_sample_url: '/assets/sample-voice-hiro.mp3',
    created_at: new Date().toISOString(),
    is_in_my_voices: false,
    added_count: 860,
    category: ['character'],
    is_builtin: false,
    country: 'JP',
    gender: 'male',
    avatar_image_url: undefined,
    avatar_preset: 'default',
    tags: ['japanese', 'calm'],
    can_commercial_use: true,
    license_code: 'commercial',
  },
  {
    _id: 'voice-lee',
    owner_id: 'owner-3',
    name: 'Lee (Neutral)',
    description: '중립적 톤의 영어 보이스',
    is_public: true,
    file_path_wav: '/mock/lee.wav',
    audio_sample_url: '/assets/sample-voice-lee.mp3',
    created_at: new Date().toISOString(),
    is_in_my_voices: false,
    added_count: 420,
    category: ['narration'],
    is_builtin: false,
    country: 'US',
    gender: 'neutral',
    avatar_image_url: undefined,
    avatar_preset: 'default',
    tags: ['english', 'neutral'],
    can_commercial_use: true,
    license_code: 'commercial',
  },
  {
    _id: 'voice-free',
    owner_id: 'owner-4',
    name: 'Non-commercial Voice',
    description: '비상업용 테스트 음성',
    is_public: true,
    file_path_wav: '/mock/free.wav',
    audio_sample_url: '/assets/sample-voice-lee.mp3',
    created_at: new Date().toISOString(),
    is_in_my_voices: false,
    added_count: 50,
    category: ['other'],
    is_builtin: false,
    country: 'US',
    gender: 'female',
    avatar_image_url: undefined,
    avatar_preset: 'default',
    tags: ['noncommercial'],
    can_commercial_use: false,
    license_code: 'non-commercial',
  },
]

export const handlers = [
  http.get('/api/storage/media/:key*', () => passthrough()),
  // ---- Credits mocks ----
  http.get('/api/me/credits', () => {
    return HttpResponse.json({ balance: creditBalance, currency: 'CREDIT' })
  }),
  http.get('/api/me/credits/packages', () => {
    return HttpResponse.json(creditPackages)
  }),
  http.post('/api/me/credits/purchase', async ({ request }) => {
    const body = (await request.json()) as { packageId?: string }
    const pkg = creditPackages.find((p) => p.id === body.packageId)
    if (!pkg) {
      return HttpResponse.json({ message: 'Invalid package' }, { status: 400 })
    }
    const bonus = pkg.bonusCredits ?? 0
    creditBalance += pkg.credits + bonus
    return HttpResponse.json({
      balance: creditBalance,
      currency: 'CREDIT',
      purchasedPackageId: pkg.id,
    })
  }),

  // ---- Voice library mocks ----
  http.get('/api/voice-samples', () => {
    return HttpResponse.json({
      samples: mockVoiceSamples,
      total: mockVoiceSamples.length,
    })
  }),

  http.get('/api/voice-samples/:id', ({ params }) => {
    const sample = mockVoiceSamples.find((v) => v._id === params.id)
    if (!sample) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(sample)
  }),

  http.post('/api/me/voices/:id/purchase', async ({ params, request }) => {
    const sampleId = params.id as string
    const body = (await request.json()) as { cost?: number }
    const sample = mockVoiceSamples.find((v) => v._id === sampleId)
    if (!sample) return HttpResponse.json({ message: 'Not found' }, { status: 404 })

    if (!sample.is_public) {
      return HttpResponse.json({ message: '비공개 보이스는 추가할 수 없습니다.' }, { status: 400 })
    }
    if (sample.can_commercial_use === false) {
      return HttpResponse.json({ message: '비상업용 보이스는 추가할 수 없습니다.' }, { status: 400 })
    }
    if (sample.is_in_my_voices) {
      return HttpResponse.json({ message: '이미 보유한 보이스입니다.' }, { status: 400 })
    }
    const cost = body.cost ?? 0
    if (creditBalance < cost) {
      return HttpResponse.json({ message: '크레딧이 부족합니다.' }, { status: 402 })
    }

    creditBalance -= cost
    sample.is_in_my_voices = true
    sample.added_count += 1

    return HttpResponse.json({
      balance: creditBalance,
      currency: 'CREDIT',
      sampleId,
    })
  }),

  http.post('/api/me/voices/:id', ({ params }) => {
    const sampleId = params.id as string
    const sample = mockVoiceSamples.find((v) => v._id === sampleId)
    if (!sample) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    sample.is_in_my_voices = true
    sample.added_count += 1
    return HttpResponse.json({ success: true })
  }),

  http.delete('/api/me/voices/:id', ({ params }) => {
    const sampleId = params.id as string
    const sample = mockVoiceSamples.find((v) => v._id === sampleId)
    if (!sample) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    sample.is_in_my_voices = false
    sample.added_count = Math.max(0, sample.added_count - 1)
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/projects', () => {
    const items = sampleProjects.map((project) => ({
      id: project.id,
      title: project.title,
      source_language: project.source_language,
      status: project.status,
      thumbnail: project.thumbnail,
      duration_seconds: project.duration_seconds,
      targets: project.targets,
    }))

    return HttpResponse.json({ items })
  }),

  http.get('/api/projects/:id', ({ params }) => {
    const project = sampleProjects.find((item) => item.id === params.id)
    if (!project) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(project)
  }),

  http.get('/api/projects/:id/languages/:lang', ({ params }) => {
    const project = sampleProjects.find((item) => item.id === params.id)
    if (!project) {
      return HttpResponse.json({ message: 'Editor state not found' }, { status: 404 })
    }

    return HttpResponse.json({
      projectId: project.id,
      segments: sampleSegments,
      voices: sampleVoices,
      glossaries: sampleGlossaries,
      playback: {
        duration: project.assets.at(0)?.duration ?? 0,
        playbackRate: 1,
      },
    })
  }),

  http.get('/api/example-items', () => {
    return HttpResponse.json({ items: exampleItems })
  }),

  http.post('/api/example-items', async ({ request }) => {
    const payload = (await request.json()) as ExampleItemPayload
    const now = new Date().toISOString()
    const created: ExampleItem = {
      id: `example-${Date.now()}`,
      name: payload.name,
      owner: payload.owner,
      status: payload.status,
      createdAt: now,
      updatedAt: now,
    }
    exampleItems = [created, ...exampleItems]
    return HttpResponse.json({ item: created }, { status: 201 })
  }),

  http.patch('/api/example-items/:id', async ({ params, request }) => {
    const id = params.id as string
    const payload = (await request.json()) as ExampleItemPayload
    const index = exampleItems.findIndex((item) => item.id === id)
    if (index === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    const updated: ExampleItem = {
      ...exampleItems[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    }
    exampleItems[index] = updated
    return HttpResponse.json({ item: updated })
  }),

  http.delete('/api/example-items/:id', ({ params }) => {
    const id = params.id as string
    exampleItems = exampleItems.filter((item) => item.id !== id)
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/languages', () => passthrough()),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.email !== 'jjy3386@gmail.com' || body.password !== 'password') {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: mockUser,
    })
  }),

  http.get('/api/users/me', () => {
    // 필요하다면 Authorization 헤더 검증 로직 추가 가능
    return HttpResponse.json(mockUser)
  }),
]
