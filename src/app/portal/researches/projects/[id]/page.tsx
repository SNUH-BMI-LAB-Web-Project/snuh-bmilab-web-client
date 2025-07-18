'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Image from 'next/image';
import { ProjectApi } from '@/generated-api/apis/ProjectApi';
import { ProjectDetail } from '@/generated-api/models/ProjectDetail';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { canDeleteProject, canEditProject } from '@/utils/project-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectInfoForm from '@/components/portal/researches/projects/project-info-form';
import ProjectArchiveForm from '@/components/portal/researches/projects/project-archive-form';
import ConfirmModal from '@/components/common/confirm-modal';
import { positionLabelMap } from '@/constants/position-enum';
import { getApiConfig } from '@/lib/config';

const projectApi = new ProjectApi(getApiConfig());

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [project, setProject] = useState<ProjectDetail>({});
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await projectApi.getProjectById({ projectId: Number(id) });
        setProject(data);
      } catch (err: unknown) {
        console.log(err);
      }
    };

    fetchProject();
  }, [id]);

  const currentUserId = useAuthStore.getState().user?.userId;
  const leaderIds = project?.leaders?.map((u) => String(u.userId)) ?? [];
  const participantIds =
    project?.participants?.map((u) => String(u.userId)) ?? [];
  const authorId = String(project?.author?.userId ?? '');
  const currentId = String(currentUserId);

  const canEdit =
    project && currentUserId
      ? canEditProject(leaderIds, participantIds, authorId, currentId)
      : false;

  const canDelete =
    project && currentUserId
      ? canDeleteProject(leaderIds, authorId, currentId)
      : false;

  const handleDelete = async () => {
    try {
      await projectApi.deleteProjectById({ projectId: Number(id) });
      toast.success('프로젝트가 삭제되었습니다');
      router.push('/portal/researches/projects');
    } catch (e) {
      console.log(e);
    } finally {
      setShowDeleteAlert(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-4 md:px-10 lg:px-20">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-row items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/portal/researches/projects')}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold break-words md:text-3xl">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Image
            src={
              project.author?.profileImageUrl &&
              project.author?.profileImageUrl.trim() !== ''
                ? project.author?.profileImageUrl
                : '/default-profile-image.svg'
            }
            alt={project.author?.name || '사용자 프로필'}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex flex-col text-sm break-words">
            <div className="font-medium text-black">{project.author?.name}</div>
            <div className="text-muted-foreground text-xs">
              {project.author?.organization} {project.author?.department}{' '}
              {project.author?.position &&
                positionLabelMap[project.author.position]}{' '}
              · {project.author?.email}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-end gap-2">
          {(canEdit || canDelete) && (
            <div className="flex flex-row justify-end gap-2">
              {canEdit && (
                <Button asChild>
                  <Link href={`/portal/researches/projects/${id}/edit`}>
                    <Edit /> 수정하기
                  </Link>
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteAlert(true)}
                >
                  <Trash /> 삭제하기
                </Button>
              )}
            </div>
          )}
          <div className="text-muted-foreground w-full text-right text-xs">
            <div>
              최초 작성일:{' '}
              {project.createdAt
                ? formatDateTime(project.createdAt.toString())
                : '-'}
            </div>
            <div>
              최종 수정일:{' '}
              {project.updatedAt
                ? formatDateTime(project.updatedAt.toString())
                : '-'}
            </div>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4 flex w-full flex-wrap justify-between gap-2">
          <TabsTrigger
            value="info"
            className="min-w-[120px] flex-1 py-2 text-sm"
          >
            프로젝트 정보
          </TabsTrigger>
          <TabsTrigger
            value="archive"
            className="min-w-[120px] flex-1 py-2 text-sm"
          >
            자료실
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 sm:mt-6">
          <ProjectInfoForm
            id={project.projectId?.toString() ?? ''}
            project={project}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="archive" className="mt-4 sm:mt-6">
          <ProjectArchiveForm projectId={project.projectId!} />
        </TabsContent>
      </Tabs>

      <ConfirmModal
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        title="프로젝트 삭제"
        description="해당 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDelete}
      />
    </div>
  );
}
