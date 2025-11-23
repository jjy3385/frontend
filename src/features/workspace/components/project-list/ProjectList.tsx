import type { ProjectSummary } from '@/entities/project/types'
import { Button } from '@/shared/ui/Button'

import { EpisodeCard } from './EpisodeCard'

type ProjectListProps = {
  projects: ProjectSummary[]
  onExport?: (project: ProjectSummary) => void
  onDelete?: (project: ProjectSummary) => void
  onTagClick?: (tag: string) => void
  isFilteredEmpty?: boolean
  onClearFilters?: () => void
  onCreate?: () => void
}

export function ProjectList({
  projects,
  onExport,
  onDelete,
  onTagClick,
  isFilteredEmpty = false,
  onClearFilters,
  onCreate,
}: ProjectListProps) {
  if (isFilteredEmpty) {
    return (
      <div className="bg-surface-1 text-center rounded-3xl p-10 shadow-soft">
        <div className="mx-auto mb-4 h-24 w-24 text-primary">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <circle cx="60" cy="60" r="55" fill="hsl(var(--primary) / 0.08)" />
            <path
              d="M40 55h40M40 70h25"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <rect x="35" y="35" width="50" height="50" rx="10" fill="hsl(var(--primary) / 0.12)" />
          </svg>
        </div>
        <h3 className="text-foreground text-xl font-semibold">검색 결과가 없습니다</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          검색어나 필터를 조정해 다시 시도해 주세요.
        </p>
        {onClearFilters ? (
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={onClearFilters}>
              필터 초기화
            </Button>
          </div>
        ) : null}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="bg-surface-1 border-surface-4/80 text-center rounded-3xl border p-10 shadow-soft">
        <div className="mx-auto mb-6 h-40 w-40 max-w-[260px]">
          <EmptyStateIllustration />
        </div>
        <h3 className="text-foreground text-xl font-semibold">진행 중인 에피소드가 없습니다</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          유튜브 링크를 붙여넣거나 파일을 업로드해 첫 에피소드를 시작해보세요.
        </p>
        <div className="mt-6 flex justify-center">
          <Button size="lg" onClick={onCreate}>
            새 에피소드 시작하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {projects.map((project) => (
        <EpisodeCard
          key={project.id}
          project={project}
          onExport={onExport}
          onDelete={onDelete}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  )
}

function EmptyStateIllustration() {
  return (
    <svg
      viewBox="0 0 220 200"
      role="img"
      aria-hidden="true"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="micGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.65" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="90" fill="hsl(var(--primary) / 0.08)" />
      <circle cx="110" cy="90" r="55" fill="hsl(var(--primary) / 0.08)" />
      <rect
        x="95"
        y="35"
        width="30"
        height="90"
        rx="15"
        fill="url(#micGradient)"
      />
      <rect
        x="80"
        y="60"
        width="60"
        height="40"
        rx="12"
        fill="hsl(var(--primary) / 0.18)"
      />
      <rect
        x="88"
        y="68"
        width="44"
        height="24"
        rx="6"
        fill="hsl(var(--primary) / 0.28)"
      />
      <path
        d="M70 100c0 22 18 40 40 40s40-18 40-40"
        stroke="hsl(var(--primary))"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="101" y="134" width="18" height="42" rx="4" fill="hsl(var(--primary))" />
      <rect
        x="86"
        y="172"
        width="48"
        height="12"
        rx="6"
        fill="hsl(var(--primary) / 0.3)"
      />
      <circle cx="60" cy="55" r="12" fill="hsl(var(--primary) / 0.16)" />
      <circle cx="160" cy="55" r="12" fill="hsl(var(--primary) / 0.16)" />
      <text
        x="60"
        y="59"
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill="hsl(var(--primary))"
      >
        A
      </text>
      <text
        x="160"
        y="59"
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill="hsl(var(--primary))"
      >
        가
      </text>
    </svg>
  )
}
