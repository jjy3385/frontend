import { useEffect, useState } from 'react'
import { ProjectCard } from './components/ProjectCard'
import { ProcessingDashboard } from './components/ProcessingDashboard'
import { Button } from './components/ui/button'
import { Plus, Video } from 'lucide-react'
import { Toaster } from './components/ui/sonner'
import type { ApiProject, Project } from './types'
import { CreateProjectModal } from './features/projects/components/CreateProjectModal'
import { useCreateProjectModal } from './features/projects/hooks/useCreateProjectModal'

//  API 스키마 / UI 스키마 매핑
function mapApiProject(api: ApiProject): Project {
  const fileName = api.video_source.split('/').pop() ?? api._id
  const displayName = fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')

  return {
    id: api._id,
    name: displayName,
    status: 'processing',
    uploadProgress: 0,
    createdAt: new Date(api.created_at).toLocaleString('ko-KR'),
    languages: [
      {
        code: 'default',
        name: '기본',
        subtitle: true,
        dubbing: true,
        progress: Math.round(
          api.segments.length > 0
            ? (api.segments.filter((s) => s.score >= 0.9).length / api.segments.length) * 100
            : 0
        ),
        status: 'processing',
        translatorId: api.editor_id,
        translator: api.editor_id,
      },
    ],
  }
}

export default function App() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  if (!API_BASE_URL) {
    throw new Error('환경 변수 VITE_API_BASE_URL이 설정되지 않았습니다.')
  }

  const [viewMode, setViewMode] = useState<'owner' | 'translator'>('owner')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    async function loadProjects() {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects`)
      const data: ApiProject[] = await res.json()
      setProjects(data.map(mapApiProject))
    }

    loadProjects()
  }, [])

  const createProjectModal = useCreateProjectModal({
    async onSubmit() {
      // TODO: S3 업로드 등 실제 처리를 여기에 작성
    },
  })

  const handleProjectUpdate = (updated: Project) => {
    setProjects((prev) => prev.map((project) => (project.id === updated.id ? updated : project)))
    setSelectedProject(updated)
  }

  if (selectedProject && viewMode === 'owner') {
    return (
      <>
        <ProcessingDashboard
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onUpdateProject={handleProjectUpdate}
        />
        <Toaster />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1>Video Dubbing Studio</h1>
                <p className="text-xs text-gray-500">AI 기반 영상 자동 더빙 솔루션</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'owner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('owner')
                  setSelectedProject(null)
                }}
              >
                배급자 모드
              </Button>
              <Button
                variant={viewMode === 'translator' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  // setViewMode('translator')
                  // setSelectedProject(null)
                }}
              >
                번역가 모드
              </Button>
              {viewMode === 'owner' && (
                <Button onClick={createProjectModal.open} className="gap-2 ">
                  <Plus />새 프로젝트
                </Button>
              )}
            </div>
          </div>

          {viewMode === 'translator' && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                담당 번역가별로 할당된 작업을 확인하고 편집할 수 있습니다.
              </p>
              {<p className="text-xs text-gray-500">아직 번역가에게 할당된 작업이 없습니다.</p>}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2>프로젝트</h2>
          <p className="text-sm text-gray-500">총 {projects.length}개의 프로젝트</p>
        </div>

        {viewMode === 'owner' ? (
          projects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="mb-2">프로젝트가 없습니다</h3>
              <p className="text-sm text-gray-500 mb-6">
                첫 번째 프로젝트를 생성하여 영상 더빙을 시작하세요
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={viewMode === 'owner' ? () => setSelectedProject(project) : undefined}
                />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-6">
            {/* <TranslatorAssignments
              assignments={translatorAssignments}
              onOpenAssignment={setActiveTranslatorAssignment}
            /> */}
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={createProjectModal.isOpen}
        onClose={createProjectModal.close}
        form={createProjectModal.form}
        onSubmit={createProjectModal.submit}
      />
      <Toaster />
    </div>
  )
}
