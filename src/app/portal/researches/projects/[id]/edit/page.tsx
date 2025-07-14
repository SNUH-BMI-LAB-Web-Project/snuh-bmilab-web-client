'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { ProjectForm } from '@/components/portal/researches/projects/project-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProjectApi } from '@/generated-api/apis/ProjectApi';
import type { ProjectDetail } from '@/generated-api/models/ProjectDetail';
import type { ProjectRequest } from '@/generated-api/models/ProjectRequest';
import { ProjectFileSummary } from '@/generated-api';
import { toast } from 'sonner';
import { getApiConfig } from '@/lib/config';

const projectApi = new ProjectApi(getApiConfig());

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const data = await projectApi.getProjectById({
          projectId: Number(id),
        });
        setProject(data);
      } catch (error) {
        console.error('프로젝트 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  const handleUpdate = async (
    data: { projectId: number; request: ProjectRequest },
    newFiles: ProjectFileSummary[],
    removedFileUrls: ProjectFileSummary[],
  ): Promise<void> => {
    try {
      const removedFileIds = removedFileUrls
        .map((f) => f.fileId!)
        .filter(Boolean);

      if (removedFileIds.length > 0) {
        await Promise.all(
          removedFileIds.map((fileId) =>
            projectApi.deleteProjectFile({ projectId: data.projectId, fileId }),
          ),
        );
      }

      const fileIds = newFiles.map((f) => f.fileId!).filter(Boolean);

      await projectApi.updateProject({
        projectId: data.projectId,
        projectRequest: {
          ...data.request,
          fileIds,
        },
      });

      toast.success('프로젝트가 성공적으로 수정되었습니다.');
      router.push(`/portal/researches/projects/${data.projectId}`);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <div className="px-30 py-10 text-center">불러오는 중...</div>;
  }

  if (!project) {
    return (
      <div className="px-30 py-10 text-center">
        프로젝트를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col px-30">
      {/* 헤더 */}
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(`/portal/researches/projects/${project.projectId}`)
          }
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">연구 & 프로젝트 수정</h1>
      </div>

      {/* 수정 폼 */}
      <ProjectForm initialData={project} onUpdate={handleUpdate} isEditing />
    </div>
  );
}
