import { useRef, useState } from 'react'

interface UseResizablePanesReturn {
  // State
  audioPaneRatio: number
  summaryPaneRatio: number
  contentRef: React.RefObject<HTMLDivElement>
  topRowRef: React.RefObject<HTMLDivElement>
  // Handlers
  startVerticalDrag: (e: React.PointerEvent<HTMLDivElement>) => void
  startHorizontalDrag: (e: React.PointerEvent<HTMLDivElement>) => void
}

/**
 * 에디터 레이아웃의 리사이즈 가능한 패널을 관리하는 훅
 *
 * - 상/하 분할: 비디오+요약 영역 vs 오디오 트랙 영역
 * - 좌/우 분할: 비디오 영역 vs 요약/번역 패널
 */
export function useResizablePanes(): UseResizablePanesReturn {
  // 레이아웃 비율 상태
  // 전체 에디터 높이 중 하단 오디오 트랙 비율 (0.2 ~ 0.8)
  const [audioPaneRatio, setAudioPaneRatio] = useState(0.4)
  // 상단 가로 영역에서 오른쪽 요약/번역 패널 비율 (0.2 ~ 0.7)
  const [summaryPaneRatio, setSummaryPaneRatio] = useState(0.35)

  // 높이 계산용 컨테이너, 가로 분할용 컨테이너 ref
  const contentRef = useRef<HTMLDivElement | null>(null)
  const topRowRef = useRef<HTMLDivElement | null>(null)

  // 상/하 분할 드래그 시작
  const startVerticalDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!contentRef.current) return

    const handleMove = (moveEvt: PointerEvent) => {
      const rect = contentRef.current!.getBoundingClientRect()
      // 컨테이너 내부에서 마우스가 차지하는 상대적인 Y 비율 (0~1)
      let topRatio = (moveEvt.clientY - rect.top) / rect.height
      // 위쪽 영역 최소/최대 20%~80%로 제한
      topRatio = Math.min(0.8, Math.max(0.2, topRatio))
      // 아래 오디오 영역 비율은 나머지
      const newAudioRatio = 1 - topRatio
      setAudioPaneRatio(newAudioRatio)
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      document.body.style.cursor = ''
    }

    document.body.style.cursor = 'row-resize'
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  // 좌/우 분할 드래그 시작 (영상 vs 세그먼트 패널)
  const startHorizontalDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!topRowRef.current) return

    const handleMove = (moveEvt: PointerEvent) => {
      const rect = topRowRef.current!.getBoundingClientRect()
      const leftWidth = moveEvt.clientX - rect.left
      let rightRatio = 1 - leftWidth / rect.width // 오른쪽이 차지하는 비율
      rightRatio = Math.min(0.7, Math.max(0.2, rightRatio))
      setSummaryPaneRatio(rightRatio)
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      document.body.style.cursor = ''
    }

    document.body.style.cursor = 'col-resize'
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return {
    audioPaneRatio,
    summaryPaneRatio,
    contentRef,
    topRowRef,
    startVerticalDrag,
    startHorizontalDrag,
  }
}
