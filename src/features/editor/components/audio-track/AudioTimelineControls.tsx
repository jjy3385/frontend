import { ZoomControl } from './ZoomControl'

export function AudioTimelineControls() {
  return (
    <div className="flex items-center justify-end border-b border-outline/40 bg-surface-1 px-3 py-1">
      <ZoomControl />
    </div>
  )
}
