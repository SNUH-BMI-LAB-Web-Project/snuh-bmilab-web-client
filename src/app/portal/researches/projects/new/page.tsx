'use client';

import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/researches/projects/project-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProjectApi } from '@/generated-api/apis/ProjectApi';
import { Configuration } from '@/generated-api/runtime';
import { useAuthStore } from '@/store/auth-store';
import { ProjectRequest } from '@/generated-api';

const projectApi = new ProjectApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

export default function NewProject() {
  const router = useRouter();

  // TODO: 토스트 처리
  const handleCreate = async (data: ProjectRequest, newFiles: File[]) => {
    try {
      console.log('폼 제출 데이터:', data);

      await projectApi.createNewProject({
        request: data,
        files: newFiles,
      });

      alert('프로젝트가 성공적으로 등록되었습니다!');
      router.push('/portal/researches/projects');
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 등록에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col px-30">
      {/* 헤더 */}
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">연구 & 프로젝트 등록</h1>
      </div>

      {/* 등록 폼 */}
      <ProjectForm onCreate={handleCreate} />
    </div>
  );
}
