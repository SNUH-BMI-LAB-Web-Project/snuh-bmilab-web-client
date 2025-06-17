'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Image from 'next/image';
import { ProjectApi } from '@/generated-api/apis/ProjectApi';
import { ProjectDetail } from '@/generated-api/models/ProjectDetail';
import { Configuration } from '@/generated-api/runtime';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { canDeleteProject, canEditProject } from '@/data/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectInfoForm from '@/components/portal/researches/projects/project-info-form';
import ProjectArchiveForm from '@/components/portal/researches/projects/project-archive-form';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail>({});
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [tab, setTab] = useState('info');

  const { id } = use(params);
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const api = new ProjectApi(
          new Configuration({
            basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
            accessToken: async () => useAuthStore.getState().accessToken || '',
          }),
        );
        const data = await api.getProjectById({ projectId: Number(id) });
        setProject(data);
      } catch (err) {
        toast.error('프로젝트 정보를 불러오는 데 실패했습니다.');
      }
    };

    fetchProject();
  }, [id]);

  const currentUserId = useAuthStore.getState().user?.userId;
  const userRole = useAuthStore.getState().role;

  const canEdit =
    project && currentUserId
      ? canEditProject(
          project.leaders?.map((u) => String(u.userId)) ?? [],
          String(currentUserId),
        )
      : false;

  const canDelete =
    project && currentUserId
      ? canDeleteProject(
          project.leaders?.map((u) => String(u.userId)) ?? [],
          String(project.author?.userId),
          String(currentUserId),
          userRole as 'USER' | 'ADMIN',
        )
      : false;

  const handleDelete = () => {
    // 실제 삭제 로직 필요
    router.push('/');
  };

  return (
    <div className="flex flex-col gap-8 px-20">
      <div className="flex items-center justify-between">
        <div className="flex flex-row">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{project.title}</h1>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
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
          <div className="flex flex-col">
            <div className="font-medium text-black">{project.author?.name}</div>
            <div className="text-xs">
              {project.author?.organization} {project.author?.department}
              {project.author?.affiliation} · {project.author?.email}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-3">
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
          <div className="text-muted-foreground ml-auto text-xs">
            작성일{' '}
            {project.createdAt
              ? formatDateTime(project.createdAt.toString())
              : null}
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 w-full justify-around">
          <TabsTrigger value="info" className="flex-1">
            프로젝트 정보
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex-1">
            자료실
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <ProjectInfoForm
            id={project.projectId?.toString() ?? ''}
            project={project}
          />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <ProjectArchiveForm projectId={project.projectId!} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
