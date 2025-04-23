'use client';

import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/researches/projects/project-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Project } from '@/types/researches';

export default function NewProject() {
  const router = useRouter();

  // 프로젝트 생성 처리 (실제 구현에서는 API 호출 필요)
  const handleSubmit = (data: Project) => {
    console.log('새 프로젝트 데이터:', data);
    // 여기에 실제 생성 로직 구현
    router.push('/');
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
        <h1 className="text-3xl font-bold">새 프로젝트 등록</h1>
      </div>

      <ProjectForm onSubmit={handleSubmit} />
    </div>
  );
}
