'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SquareLibrary, NotepadText, Paperclip, Plus, Tag } from 'lucide-react';
import { cn, setDateWithFixedHour } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { FileItem } from '@/components/portal/researches/projects/file-item';
import {
  ExternalProfessorRequest,
  ExternalProfessorSummary,
  ProjectApi,
  ProjectDetail,
  ProjectFileSummary,
  ProjectRequest,
  UserSummary,
} from '@/generated-api';
import { GeneratePresignedUrlDomainTypeEnum } from '@/generated-api/apis/FileApi';
import { uploadFileWithPresignedUrl } from '@/lib/upload';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import { useProjectCategories } from '@/hooks/use-project-categories';
import dynamic from 'next/dynamic';
import { getApiConfig } from '@/lib/config';

const MarkdownEditor = dynamic(
  () => import('@/components/portal/researches/projects/markdown-editor'),
  {
    ssr: false, // 에러로 인해 SSR 방지하기 위해
  },
);

interface ProjectFormProps {
  initialData?: ProjectDetail;
  onCreate?: (
    data: ProjectRequest,
    newFiles: ProjectFileSummary[],
    irbFiles?: ProjectFileSummary[],
    drbFiles?: ProjectFileSummary[],
  ) => void;
  onUpdate?: (
    data: { projectId: number; request: ProjectRequest },
    newFiles: ProjectFileSummary[],
    removedFileUrls: ProjectFileSummary[],
  ) => void;
  isEditing?: boolean;
}

const projectApi = new ProjectApi(getApiConfig());

export function BoardPostForm({
  initialData,
  onCreate,
  onUpdate,
  isEditing = false,
}: ProjectFormProps) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<ProjectRequest>({
    mode: 'onSubmit',
    defaultValues: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      categoryId: initialData?.category?.categoryId ?? undefined,
      irbId: initialData?.irbId ?? '',
      drbId: initialData?.drbId ?? '',
    },
  });
  const [isPrivate, setIsPrivate] = useState<boolean>(
    initialData?.isPrivate ?? false,
  );

  const { data: categoryList = [] } = useProjectCategories();

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined,
  );

  const [isWaiting, setIsWaiting] = useState<boolean>(
    initialData?.status === 'WAITING',
  );

  const [piList, setPiList] = useState<ExternalProfessorSummary[]>(
    initialData?.piList ?? [],
  );

  const [practicalProfessors, setPracticalProfessors] = useState<
    ExternalProfessorSummary[]
  >(initialData?.practicalProfessors ?? []);

  const [leaders, setLeaders] = useState<UserSummary[]>(
    initialData?.leaders ?? [],
  );

  const [participants, setParticipants] = useState<UserSummary[]>(
    initialData?.participants ?? [],
  );

  const [existingFiles, setExistingFiles] = useState<ProjectFileSummary[]>(
    initialData?.files ?? [],
  );
  const [newFiles, setNewFiles] = useState<ProjectFileSummary[]>([]);
  const [removedFiles, setRemovedFiles] = useState<ProjectFileSummary[]>([]);
  const irbInputRef = useRef<HTMLInputElement>(null);
  const drbInputRef = useRef<HTMLInputElement>(null);

  const [irbFiles, setIrbFiles] = useState<ProjectFileSummary[]>([]);
  const [drbFiles, setDrbFiles] = useState<ProjectFileSummary[]>([]);

  const [showPIModal, setShowPIModal] = useState(false);
  const [showProfessorModal, setShowProfessorModal] = useState(false);

  const getProfessorKey = (p: {
    name?: string;
    organization?: string;
    department?: string;
    position?: string;
  }) => `${p.name}-${p.organization}-${p.department}-${p.position}`;

  const selectedPiKeys = piList.map(getProfessorKey);
  const selectedPracticalKeys = practicalProfessors.map(getProfessorKey);

  const handleRemoveExistingFile = (index: number) => {
    const removed = existingFiles[index];
    setRemovedFiles((prev) => [...prev, removed]);
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { target } = e;
    const files = Array.from(target.files ?? []);
    if (!files.length) return;

    try {
      const uploadPromises = files.map((file) =>
        uploadFileWithPresignedUrl(
          file,
          accessToken!,
          GeneratePresignedUrlDomainTypeEnum.Project,
        )
          .then((fileRecord) => {
            toast.success(`${file.name} 업로드 완료`);
            return fileRecord;
          })
          .catch(() => {
            console.log(`${file.name} 업로드 실패`);
            return null;
          }),
      );

      const uploaded = await Promise.all(uploadPromises);
      const validFiles = uploaded.filter(
        (record): record is ProjectFileSummary => record !== null,
      );
      setNewFiles((prev) => [...prev, ...validFiles]);
    } finally {
      target.value = '';
    }
  };

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (!files.length) return;

      const uploadPromises = files.map((file) =>
        uploadFileWithPresignedUrl(
          file,
          accessToken!,
          GeneratePresignedUrlDomainTypeEnum.Project,
        )
          .then((fileRecord) => {
            toast.success(`${file.name} 업로드 완료`);
            return fileRecord;
          })
          .catch(() => {
            console.log(`${file.name} 업로드 실패`);
            return null;
          }),
      );

      const uploaded = await Promise.all(uploadPromises);
      const validFiles = uploaded.filter(
        (record): record is ProjectFileSummary => record !== null,
      );
      setNewFiles((prev) => [...prev, ...validFiles]);
    },
    [accessToken],
  );

  const handleFormSubmit = async (formData: ProjectRequest) => {
    const hasEmptyRequiredField =
      !formData.title?.trim() ||
      !formData.content?.trim() ||
      !formData.categoryId ||
      !startDate ||
      leaders.length === 0;

    if (hasEmptyRequiredField) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    const request: ProjectRequest = {
      title: formData.title!,
      content: formData.content!,
      leaderIds: leaders
        .map((u) => Number(u.userId))
        .filter((id): id is number => !Number.isNaN(id)),
      participantIds: participants
        .map((u) => u.userId)
        .filter((id): id is number => !!id),
      startDate: setDateWithFixedHour(startDate),
      endDate: endDate ? setDateWithFixedHour(endDate) : undefined,
      piList: piList as ExternalProfessorRequest[],
      practicalProfessors: practicalProfessors as ExternalProfessorRequest[],
      irbId: formData.irbId,
      drbId: formData.drbId,
      irbFileIds: irbFiles.map((f) => f.fileId!),
      drbFileIds: drbFiles.map((f) => f.fileId!),
      fileIds: newFiles.map((file) => file.fileId!),
      isWaiting,
      categoryId: formData.categoryId,
      isPrivate,
    };

    try {
      if (isEditing) {
        const projectId = initialData?.projectId;
        if (projectId !== undefined) {
          await onUpdate?.({ projectId, request }, newFiles, removedFiles);

          if (endDate) {
            await projectApi.completeProject({
              projectId,
              projectCompleteRequest: {
                endDate: setDateWithFixedHour(endDate),
              },
            });
          }
        } else {
          console.error('프로젝트 ID가 없음');
        }
      } else {
        await onCreate?.(
          request,
          newFiles,
          irbFiles ?? undefined,
          drbFiles ?? undefined,
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-8 rounded-lg border bg-white p-8 shadow-sm">
        {/* 제목 */}
        <div className="space-y-3 pt-2 pb-6">
          <Label className="flex items-center gap-1 text-base font-medium">
            <Tag className="h-4 w-4" />
            제목 <span className="text-destructive text-xs">*</span>
          </Label>

          <Input
            id="title"
            placeholder="제목을 입력하세요"
            {...register('title')}
            className="focus-visible:none rounded-none border-0 border-b px-0 !text-xl font-medium shadow-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {errors.title && (
            <p className="text-destructive mt-2 text-sm">
              {errors.title.message as string}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* 카테고리 */}
          <div className="space-y-3">
            <Label className="flex items-center text-base font-medium">
              <SquareLibrary className="h-4 w-4" />
              카테고리 <span className="text-destructive text-xs">*</span>
            </Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <div className="w-full">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="연구 분야 선택" />
                    </SelectTrigger>
                  </div>
                  <SelectContent>
                    {categoryList.map((cat) => (
                      <SelectItem
                        key={cat.categoryId}
                        value={cat.categoryId!.toString()}
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Separator className="my-6" />

          {/* 게시글 본문 */}
          <div className="space-y-4">
            <Label
              htmlFor="content"
              className="flex items-center text-base font-medium"
            >
              <NotepadText className="h-4 w-4" />
              게시글 본문 <span className="text-destructive text-xs">*</span>
            </Label>
            <MarkdownEditor
              content={watch('content') ?? ''}
              setContent={(val) => setValue('content', val)}
              hasMoreFeatures
            />
          </div>

          {/* 첨부 파일 */}
          <div className="space-y-4">
            <Label className="flex items-center text-base font-medium">
              <Paperclip className="h-4 w-4" />
              첨부파일
            </Label>

            <div
              className={cn(
                'rounded-md border border-2 border-dashed p-6 text-center transition-colors',
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50',
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              {/* eslint-disable jsx-a11y/label-has-associated-control */}
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileInputChange}
                />
                <div className="bg-primary/10 rounded-full p-2">
                  <Plus className="text-primary h-6 w-6" />
                </div>
                <span className="text-muted-foreground font-medium">
                  파일 추가하기
                </span>
                <span className="text-muted-foreground text-sm">
                  또는 파일을 여기에 끌어다 놓으세요
                </span>
              </label>
            </div>

            {existingFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium">기존 파일</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {existingFiles.map((file, index) => (
                    <FileItem
                      key={file.fileId}
                      file={{
                        name: file.fileName!,
                        size: file.size,
                      }}
                      index={index}
                      onAction={handleRemoveExistingFile}
                      mode="remove"
                    />
                  ))}
                </div>
              </div>
            )}

            {newFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium">새 파일</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {newFiles.map((file, index) => (
                    <FileItem
                      key={crypto.randomUUID()}
                      file={{
                        name: file.fileName!,
                        size: file.size,
                      }}
                      index={index}
                      onAction={handleRemoveNewFile}
                      mode="remove"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 버튼 */}
      <div className="mt-8 flex justify-end">
        <Button type="submit" className="px-10">
          {isEditing ? '저장' : '등록'}
        </Button>
      </div>
    </form>
  );
}
