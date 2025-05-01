'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  ArrowLeft,
  Edit,
  Trash,
  Paperclip,
  Info,
  NotepadText,
} from 'lucide-react';
import { allProjects } from '@/data/projects';
import { users } from '@/data/users';
import { currentUser, canEditProject, canDeleteProject } from '@/data/auth';
import { formatDateTime } from '@/lib/utils';
import { getStatusClassName } from '@/utils/project-utils';
import UserPopover from '@/components/common/user-popover';
import Image from 'next/image';
import MeetingTimeline from '@/components/portal/researches/projects/meetings/meeting-timeline';
import { Meeting } from '@/types/meeting';
import { allMeetings } from '@/data/meetings';
import { FileItem } from '@/components/portal/researches/projects/file-item';
import { Label } from '@/components/ui/label';

export default function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const { id } = use(params);
  const project = allProjects.find((p) => p.projectId === id);
  const authorUser = users.find((u) => u.userId === project?.authorId);

  if (!project) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold">프로젝트를 찾을 수 없습니다.</h2>
        <p className="text-muted-foreground mt-2">
          유효하지 않은 프로젝트 ID입니다.
        </p>
        <Button className="mt-6" onClick={() => router.push('/')}>
          홈으로 이동
        </Button>
      </div>
    );
  }

  const canEdit =
    project && canEditProject(project.leaderId, currentUser.userId);
  const canDelete =
    project &&
    canDeleteProject(
      project.leaderId,
      project.authorId,
      currentUser.userId,
      currentUser.role,
    );

  const handleDelete = () => {
    // 실제 삭제 로직 필요
    router.push('/');
  };

  const downloadFile = (file: { name: string; url: string }) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const leaderUsers = users.filter((u) => project.leaderId.includes(u.userId));
  const participantUsers = users.filter((u) =>
    project.participantId.includes(u.userId),
  );

  const meetings = allMeetings.filter(
    (meeting: Meeting) => meeting.projectId === id,
  );

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
              authorUser?.profileImageUrl &&
              authorUser.profileImageUrl.trim() !== ''
                ? authorUser.profileImageUrl
                : '/default-profile-image.svg'
            }
            alt={authorUser?.name || '사용자 프로필'}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <div className="font-medium text-black">{authorUser?.name}</div>
            <div className="text-xs">
              {authorUser?.department} · {authorUser?.email}
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
            작성일 {formatDateTime(project.createdAt)}
          </div>
        </div>
      </div>

      <div className="border-t" />

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Label className="flex flex-row text-lg font-semibold">
              <NotepadText className="h-4 w-4" />
              <span>연구 내용</span>
            </Label>

            <Card>
              <CardContent className="flex h-full flex-col justify-start gap-2">
                <div className="whitespace-pre-line">{project.content}</div>
              </CardContent>
            </Card>
          </div>

          <MeetingTimeline projectId={id} meetings={meetings} />
        </div>

        <div className="col-span-1 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Label className="flex flex-row text-lg font-semibold">
              <Info className="h-4 w-4" />
              <span>연구 정보</span>
            </Label>
            <Card>
              <CardContent className="flex h-full flex-col justify-center gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span>연구 분야</span>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {project.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span>연구 상태</span>
                    <Badge className={getStatusClassName(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span>연구 기간</span>
                    <div className="text-muted-foreground text-sm font-normal">
                      {project.startDate} ~ {project.endDate || ''}
                    </div>
                  </div>
                </div>

                <div className="border-t" />

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <span className="mb-1 font-semibold">연구 책임자</span>
                    <div className="text-muted-foreground flex flex-wrap gap-1 text-sm font-normal">
                      {leaderUsers.map((user, index) => (
                        <span key={user.userId} className="flex items-center">
                          <UserPopover user={user} />
                          {index < leaderUsers.length - 1 && ','}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-1 font-semibold">연구 참여자</span>
                    <div className="text-muted-foreground flex flex-wrap gap-1 text-sm font-normal">
                      {participantUsers.length > 0 ? (
                        participantUsers.map((user, index) => (
                          <span key={user.userId} className="flex items-center">
                            <UserPopover user={user} />
                            {index < participantUsers.length - 1 && ','}
                          </span>
                        ))
                      ) : (
                        <div className="text-muted-foreground text-xs">
                          참여자가 없습니다
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col gap-4">
            <Label className="flex flex-row text-lg font-semibold">
              <Paperclip className="h-4 w-4" />
              <span>첨부파일</span>
            </Label>
            <ul className="space-y-2 text-sm">
              {project.files && project.files.length > 0 ? (
                project.files.map((file, index) => (
                  <FileItem
                    key={file.name}
                    file={{
                      name: file.name,
                      size: file.size,
                    }}
                    index={index}
                    onAction={() => downloadFile(file)}
                    mode="download"
                  />
                ))
              ) : (
                <Card className="text-muted-foreground px-4 py-6 text-center text-sm">
                  등록된 첨부파일이 없습니다.
                </Card>
              )}
            </ul>
          </div>
        </div>
      </div>

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
