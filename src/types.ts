export type RoleType = 'owner' | 'translator' | 'reviewer'

export interface User {
  id: string
  name: string
  role: RoleType
  avatarUrl?: string
  languages?: string[]
}

export interface ProjectMember {
  id: string
  name: string
  role: RoleType
  assignedLanguages?: string[]
}

export type LanguageStatus = 'pending' | 'processing' | 'review' | 'completed'

export interface Language {
  code: string
  name: string
  subtitle: boolean
  dubbing: boolean
  progress?: number
  status?: LanguageStatus
  translatorId?: string
  translator?: string
  reviewerId?: string
  deadline?: string
  translationReviewed?: boolean
  voiceConfig?: Record<string, { voiceId?: string; preserveTone: boolean }>
}
export interface STTSegment {
  id: string
  startTime: string
  endTime: string
  text: string
  speaker?: string
  confidence: number
}

export type TranslationIssueType = 'term' | 'length' | 'number' | 'tone'

export type TranslationIssueSeverity = 'warning' | 'error'

export interface TranslationIssue {
  type: TranslationIssueType
  severity: TranslationIssueSeverity
  message: string
  suggestion?: string
}

export interface CorrectionSuggestion {
  id: string
  text: string
  reason: string
}

export interface TermCorrection {
  id: string
  original: string
  replacement: string
  reason?: string
}

export interface Translation {
  id: string
  timestamp: string
  original: string
  translated: string
  confidence: number
  issues: TranslationIssue[]
  speaker?: string
  segmentDurationSeconds?: number
  originalSpeechSeconds?: number
  translatedSpeechSeconds?: number
  correctionSuggestions?: CorrectionSuggestion[]
  termCorrections?: TermCorrection[]
}

export type ProjectStatus = 'uploading' | 'processing' | 'completed' | 'failed'

export interface Project {
  id: string
  name: string
  languages: Language[]
  status: ProjectStatus
  uploadProgress?: number
  createdAt: string
  thumbnail?: string
  members?: ProjectMember[]
  seriesTitle?: string
  episodeTitle?: string
  deadline?: string
  reviewerId?: string
  ownerId?: string
}

// API 응답 타입 추가
export interface ApiProjectIssue {
  issue_id: string
  editor_id: string
}

export interface ApiProjectSegment {
  segment_id: string
  segment_text: string
  score: number
  start_point: number
  end_point: number
  editor_id: string
  translate_context: string
  sub_langth: number
  issues: ApiProjectIssue[]
}

export interface ApiProject {
  _id: string
  video_source: string
  audio_source: string
  created_at: string
  updated_at: string
  editor_id: string
  segments: ApiProjectSegment[]
}
