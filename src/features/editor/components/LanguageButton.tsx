import { Globe } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/utils'
import { getCountryCode } from '@/features/workspace/components/project-list/episodeCardUtils'

import type { LanguageOption } from '../hooks/useEditorLanguageSelection'

interface LanguageButtonProps {
  option: LanguageOption
  isSelected: boolean
  onClick: () => void
}

/**
 * 에디터 언어 선택 버튼 (국기 플래그 표시)
 * - 완료된 언어는 컬러로 활성화
 * - 미완료 언어는 grayscale로 비활성화
 * - 원어는 "원" 텍스트로 표시
 */
export function LanguageButton({ option, isSelected, onClick }: LanguageButtonProps) {
  const countryCode = option.isOriginal ? '' : getCountryCode(option.code)

  return (
    <Button
      variant={isSelected ? 'primary' : 'ghost'}
      size="sm"
      onClick={onClick}
      disabled={!option.isAvailable}
      className={cn(
        'gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
        option.isOriginal
          ? // 원어 버튼 스타일
            isSelected
            ? 'shadow-sm'
            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          : // 번역 언어 버튼 스타일
            cn(
              'relative h-8 w-12 overflow-hidden border',
              isSelected
                ? 'border-blue-500 shadow-sm'
                : 'border-gray-300 bg-white hover:border-gray-400',
              !option.isAvailable && 'cursor-not-allowed opacity-50',
            ),
      )}
      title={`${option.label}${option.isAvailable ? '' : ' (처리 중)'} ${option.progress}%`}
    >
      {option.isOriginal ? (
        // 원어는 Globe 아이콘 + "원어" 텍스트로 표시
        <>
          <Globe className="h-3.5 w-3.5" />
          <span>원어</span>
        </>
      ) : (
        // 번역 언어는 국기로 표시
        <div
          className={cn(
            'flex h-full w-full items-center justify-center',
            !option.isAvailable && 'grayscale',
          )}
        >
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}
    </Button>
  )
}
