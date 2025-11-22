import { apiClient, apiGet, apiPost } from '@/shared/api/client'

export interface CreditBalanceResponse {
  balance: number
  currency: string
}

export interface CreditPackage {
  id: string
  label: string
  credits: number
  priceKRW: number
  bonusCredits?: number
}

export interface PurchaseCreditsPayload {
  packageId: string
}

export interface PurchaseCreditsResponse extends CreditBalanceResponse {
  purchasedPackageId: string
}

export interface PurchaseVoicePayload {
  sampleId: string
  cost: number
}

export interface PurchaseVoiceResponse extends CreditBalanceResponse {
  sampleId: string
}

export async function fetchCreditBalance(): Promise<CreditBalanceResponse> {
  return apiGet<CreditBalanceResponse>('api/me/credits')
}

export async function fetchCreditPackages(): Promise<CreditPackage[]> {
  return apiGet<CreditPackage[]>('api/me/credits/packages')
}

export async function purchaseCredits(payload: PurchaseCreditsPayload): Promise<PurchaseCreditsResponse> {
  return apiClient
    .post('api/me/credits/purchase', {
      json: payload,
    })
    .json<PurchaseCreditsResponse>()
}

export async function purchaseVoiceWithCredits(payload: PurchaseVoicePayload): Promise<PurchaseVoiceResponse> {
  return apiClient
    .post(`api/me/voices/${payload.sampleId}/purchase`, {
      json: { cost: payload.cost },
    })
    .json<PurchaseVoiceResponse>()
}
