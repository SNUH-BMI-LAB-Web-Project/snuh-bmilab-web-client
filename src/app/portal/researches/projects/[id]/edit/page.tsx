'use client';

import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/researches/projects/project-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Project } from '@/types/project';
import { allProjects } from '@/data/projects';
import { use } from 'react';

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const project = allProjects.find((p) => p.projectId === id);

  // 프로젝트 수정 처리 (실제 구현에서는 API 호출 필요)
  const handleSubmit = (data: Project) => {
    console.log('수정된 프로젝트 데이터:', data);
    // 여기에 실제 수정 로직 구현
    router.push(`/projects/${id}`);
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
        <h1 className="text-3xl font-bold">연구 & 프로젝트 수정</h1>
      </div>

      <ProjectForm initialData={project} onSubmit={handleSubmit} isEditing />
    </div>
  );
}
