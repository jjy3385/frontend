import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/config/queryKeys'

import {
  fetchCreditBalance,
  fetchCreditPackages,
  purchaseCredits,
  purchaseVoiceWithCredits,
  type PurchaseCreditsPayload,
  type PurchaseCreditsResponse,
  type PurchaseVoicePayload,
  type PurchaseVoiceResponse,
  type CreditBalanceResponse,
  type CreditPackage,
} from '../api/creditsApi'

export function useCreditBalance() {
  return useQuery<CreditBalanceResponse>({
    queryKey: queryKeys.credits.balance(),
    queryFn: fetchCreditBalance,
    staleTime: 60_000,
  })
}

export function useCreditPackages() {
  return useQuery<CreditPackage[]>({
    queryKey: ['credits', 'packages'],
    queryFn: fetchCreditPackages,
    staleTime: 5 * 60_000,
  })
}

export function usePurchaseCredits() {
  const queryClient = useQueryClient()
  return useMutation<PurchaseCreditsResponse, Error, PurchaseCreditsPayload>({
    mutationFn: (payload: PurchaseCreditsPayload) => purchaseCredits(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.credits.balance() })
    },
  })
}

export function usePurchaseVoiceWithCredits() {
  const queryClient = useQueryClient()
  return useMutation<PurchaseVoiceResponse, Error, PurchaseVoicePayload>({
    mutationFn: (payload) => purchaseVoiceWithCredits(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.credits.balance() })
      void queryClient.invalidateQueries({ queryKey: ['voice-library'], exact: false })
      void queryClient.invalidateQueries({ queryKey: ['voice-samples'], exact: false })
    },
  })
}
