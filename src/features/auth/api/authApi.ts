import { apiClient } from '@/shared/api/client'

export interface SignupPayload {
  username: string
  email: string
  hashed_password: string
  role: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UserOut {
  _id?: string
  username: string
  role: string
  email: string
  createdAt: Date
  google_sub: string
}

export interface LoginResponse {
  message: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export type SignupResponse = UserOut

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  return apiClient.post('api/auth/signup', { json: payload }).json<SignupResponse>()
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient.post('api/auth/login', { json: payload }).json<LoginResponse>()
}

export async function logout(): Promise<{ message: string }> {
  return apiClient.post('api/auth/logout', {}).json<{ message: string }>()
}

export async function refreshToken(): Promise<{ message: string }> {
  return apiClient.post('api/auth/refresh', {}).json<{ message: string }>()
}

export async function getCurrentUser(): Promise<UserOut> {
  // Authentication check endpoint - no retry, fail fast
  return apiClient
    .get('api/users/me', {
      retry: 0, // No retry for auth check
      timeout: 5000, // Shorter timeout (5s instead of 15s)
    })
    .json<UserOut>()
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return apiClient.post('api/auth/change-password', { json: payload }).json<{ message: string }>()
}
