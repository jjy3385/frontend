import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'

import type { CreditPackage } from '../api/creditsApi'

interface CreditTopupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packages: CreditPackage[]
  onPurchase: (pkg: CreditPackage) => void
  isPurchasing?: boolean
  currentBalance?: number
}

export function CreditTopupModal({
  open,
  onOpenChange,
  packages,
  onPurchase,
  isPurchasing = false,
  currentBalance = 0,
}: CreditTopupModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogTitle>크레딧 충전</DialogTitle>
        <DialogDescription>원화로 결제되는 크레딧 묶음을 선택하세요.</DialogDescription>

        <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <p className="text-xs text-muted">현재 보유 크레딧</p>
          <p className="text-2xl font-semibold text-foreground">
            {currentBalance.toLocaleString()} 크레딧
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex flex-col gap-2 rounded-2xl border border-surface-3 bg-surface-1 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{pkg.label}</p>
                {pkg.bonusCredits ? <Badge tone="success">보너스 +{pkg.bonusCredits}</Badge> : null}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted">포함 크레딧</p>
                  <p className="text-lg font-semibold text-foreground">
                    {pkg.credits.toLocaleString()} 크레딧
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">가격 (KRW)</p>
                  <p className="text-lg font-semibold text-foreground">
                    ₩{pkg.priceKRW.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onPurchase(pkg)}
                disabled={isPurchasing}
              >
                {isPurchasing ? '구매 처리 중...' : '이 패키지 구매'}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
