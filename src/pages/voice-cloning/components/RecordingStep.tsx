import { Button } from '@/shared/ui/Button'

interface RecordingStepProps {
  formattedTime: string
  onStopRecording: () => void
  onCancel: () => void
}

export function RecordingStep({ formattedTime, onStopRecording, onCancel }: RecordingStepProps) {
  return (
    <div className="flex flex-col bg-surface-1 p-12 text-center text-foreground">
      {/* Recording Animation */}
      <div className="mb-8 flex justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-danger/60 opacity-75" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-danger">
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/90" />
          </div>
        </div>
      </div>

      {/* Status */}
      <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-danger">녹음 중...</p>

      {/* Timer */}
      <div className="mb-8">
        <p className="text-6xl font-bold tabular-nums text-foreground">{formattedTime}</p>
      </div>

      {/* Script */}
      <div className="mb-12 rounded-2xl bg-surface-2 p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          읽어주세요
        </p>
        <p className="text-base leading-relaxed text-foreground">
          "안녕하세요! 지금 저는 제 목소리를 녹음하고 있습니다. 잠시 뒤 이 목소리가 텍스트를
          자동으로 읽어주게 될 거예요."
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button
          type="button"
          variant="danger"
          className="rounded-full px-6 py-3 text-sm font-semibold"
          onClick={onStopRecording}
        >
          녹음 종료
        </Button>
        {/* <Button
          type="button"
          variant="secondary"
          className="rounded-full px-6 py-3 text-sm font-semibold"
          onClick={onCancel}
        >
          취소
        </Button> */}
      </div>
    </div>
  )
}
