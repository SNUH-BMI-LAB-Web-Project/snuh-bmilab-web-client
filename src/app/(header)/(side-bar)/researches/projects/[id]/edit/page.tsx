'use client';

import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/researches/projects/project-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Project, ProjectCategory, ResearchStatus } from '@/types/researches';

// 임시 데이터
const project = {
  projectId: '1',
  authorId: '1',
  title: '유전체 데이터 분석 연구',
  content:
    '본 연구는 최신 생물정보학 기술을 활용하여 유전체 데이터를 분석하고 질병 관련 유전자 변이를 식별하는 것을 목표로 합니다.\n\n한국인 유전체 데이터의 특성을 고려한 분석 모델 개발에 중점을 두고 있으며, 대규모 유전체 데이터 기반 머신러닝 모델을 개발하고 임상 검증을 설계합니다.',
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  category: 'Bioinformatics' as ProjectCategory,
  status: '진행 중' as ResearchStatus,
  createdAt: '2023-01-01T09:00:00Z',
  updatedAt: '2023-05-01T10:00:00Z',
  leaderId: ['1', '2'],
  participantId: ['1', '2', '3', '4'],
  files: [
    { name: '연구계획서.pdf', size: '2.4MB', type: 'application/pdf' },
    { name: '중간보고서.docx', size: '1.8MB', type: 'application/msword' },
    { name: '데이터셋_샘플.zip', size: '15.6MB', type: 'application/zip' },
  ],
};

export default function EditProject({ params }: { params: { id: string } }) {
  const router = useRouter();

  // 프로젝트 수정 처리 (실제 구현에서는 API 호출 필요)
  const handleSubmit = (data: Project) => {
    console.log('수정된 프로젝트 데이터:', data);
    // 여기에 실제 수정 로직 구현
    router.push(`/projects/${params.id}`);
  };

  return (
    <div className="flex flex-col px-30">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">프로젝트 수정</h1>
      </div>

      <ProjectForm initialData={project} onSubmit={handleSubmit} isEditing />
    </div>
  );
}
