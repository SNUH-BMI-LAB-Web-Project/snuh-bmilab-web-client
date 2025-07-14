'use client';

import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/portal/researches/projects/project-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProjectApi } from '@/generated-api/apis/ProjectApi';
import { ProjectFileSummary, ProjectRequest } from '@/generated-api';
import { toast } from 'sonner';
import { getApiConfig } from '@/lib/config';

const projectApi = new ProjectApi(getApiConfig());

export default function NewProject() {
  const router = useRouter();

  const handleCreate = async (
    data: ProjectRequest,
    newFiles: ProjectFileSummary[],
    irbFiles?: ProjectFileSummary[],
    drbFiles?: ProjectFileSummary[],
  ) => {
    try {
      await projectApi.createNewProject({
        projectRequest: {
          ...data,
          fileIds: newFiles.map((file) => file.fileId!).filter(Boolean),
          irbFileIds: (irbFiles ?? []).map((f) => f.fileId!).filter(Boolean),
          drbFileIds: (drbFiles ?? []).map((f) => f.fileId!).filter(Boolean),
        },
      });

      toast.success('프로젝트가 성공적으로 등록되었습니다!');
      router.push('/portal/researches/projects');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col px-30">
      {/* 헤더 */}
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/portal/researches/projects')}
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
