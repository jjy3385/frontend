import { create } from 'zustand'

type SSEConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

/**
 * 오디오 생성 이벤트 구독자 콜백 타입
 */
export type AudioEventCallback = (event: AudioGenerationEvent) => void

export type AudioGenerationEvent = {
  segmentId: string
  audioS3Key: string
  audioDuration?: number
  status: 'completed' | 'failed'
  error?: string
  projectId: string
  languageCode: string
}

interface SSESubscription {
  id: string
  projectId: string
  languageCode: string
  callback: AudioEventCallback
}

interface SSEStoreState {
  // Connection state
  connectionStatus: SSEConnectionStatus
  connectionError: string | null
  lastHeartbeat: string | null

  // Audio event subscriptions
  audioSubscriptions: SSESubscription[]

  // Actions
  setConnectionStatus: (status: SSEConnectionStatus) => void
  setConnectionError: (error: string | null) => void
  setLastHeartbeat: (timestamp: string) => void

  // Audio subscription management
  subscribeToAudioEvents: (
    projectId: string,
    languageCode: string,
    callback: AudioEventCallback,
  ) => () => void
  notifyAudioEvent: (event: AudioGenerationEvent) => void
}

/**
 * 전역 SSE 연결 상태 및 이벤트 구독 관리 스토어
 *
 * 패턴:
 * 1. 단일 SSE 연결을 전역에서 관리
 * 2. 컴포넌트는 관심있는 이벤트만 구독
 * 3. 이벤트 발생 시 해당 구독자에게만 전달
 */
export const useSSEStore = create<SSEStoreState>((set, get) => ({
  connectionStatus: 'disconnected',
  connectionError: null,
  lastHeartbeat: null,
  audioSubscriptions: [],

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setConnectionError: (error) => set({ connectionError: error }),
  setLastHeartbeat: (timestamp) => set({ lastHeartbeat: timestamp }),

  /**
   * 오디오 이벤트 구독
   * @returns unsubscribe 함수
   */
  subscribeToAudioEvents: (projectId, languageCode, callback) => {
    const id = `${projectId}:${languageCode}:${Date.now()}`
    const subscription: SSESubscription = {
      id,
      projectId,
      languageCode,
      callback,
    }

    set((state) => ({
      audioSubscriptions: [...state.audioSubscriptions, subscription],
    }))

    // Return unsubscribe function
    return () => {
      set((state) => ({
        audioSubscriptions: state.audioSubscriptions.filter((sub) => sub.id !== id),
      }))
    }
  },

  /**
   * 오디오 이벤트를 해당 구독자에게 전달
   * projectId와 languageCode가 일치하는 구독자에게만 전달
   */
  notifyAudioEvent: (event) => {
    const { audioSubscriptions } = get()

    audioSubscriptions.forEach((sub) => {
      if (sub.projectId === event.projectId && sub.languageCode === event.languageCode) {
        sub.callback(event)
      }
    })
  },
}))
