interface ResizeDividerProps {
  direction: 'horizontal' | 'vertical'
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
}

/**
 * 리사이즈 가능한 영역 사이의 구분선
 *
 * @param direction - 'horizontal': 좌/우 분할, 'vertical': 상/하 분할
 * @param onPointerDown - 드래그 시작 핸들러
 */
export function ResizeDivider({ direction, onPointerDown }: ResizeDividerProps) {
  if (direction === 'horizontal') {
    // 좌/우 경계 드래그바 (세로 선)
    return (
      <div
        className="group relative w-[3px] cursor-col-resize self-stretch"
        onPointerDown={onPointerDown}
      >
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-neutral-200 group-hover:bg-neutral-400" />
      </div>
    )
  }

  // 상/하 경계 드래그바 (가로 선)
  return (
    <div
      className="group relative -my-[2px] h-[8px] cursor-row-resize"
      onPointerDown={onPointerDown}
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-neutral-200 group-hover:bg-neutral-400" />
    </div>
  )
}
