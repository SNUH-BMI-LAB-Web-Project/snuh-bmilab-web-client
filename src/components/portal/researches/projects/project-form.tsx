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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  SquareLibrary,
  NotepadText,
  Paperclip,
  Plus,
  User,
  Users,
  Tag,
  ShieldCheck,
  Upload,
  Minus,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn, setDateWithFixedHour } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { FileItem } from '@/components/common/file-item';
import { UserTagInput } from '@/components/portal/researches/projects/user-tag-input';
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
import { Switch } from '@/components/ui/switch';
import { useProjectCategories } from '@/hooks/use-project-categories';
import dynamic from 'next/dynamic';
import ExternalProfessorSelectModal from '@/components/portal/researches/projects/external-professor-select-modal';
import { getApiConfig } from '@/lib/config';

const MarkdownEditor = dynamic(
  () => import('@/components/common/markdown-editor'),
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

export function ProjectForm({
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

  const handleUploadMultipleFiles = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'IRB' | 'DRB',
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const uploaded = await Promise.all(
      files.map((file) =>
        uploadFileWithPresignedUrl(
          file,
          accessToken!,
          GeneratePresignedUrlDomainTypeEnum.Project,
        ),
      ),
    );

    if (type === 'IRB') {
      setIrbFiles((prev) => [...prev, ...uploaded]);
    } else {
      setDrbFiles((prev) => [...prev, ...uploaded]);
    }

    e.target.value = '';
  };

  const handleRemoveIRBFile = (index: number) =>
    setIrbFiles((prev) => prev.filter((_, i) => i !== index));

  const handleRemoveDRBFile = (index: number) =>
    setDrbFiles((prev) => prev.filter((_, i) => i !== index));

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
        {/* 연구 제목 */}
        <div className="space-y-3 pt-2 pb-6">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 아이콘 + 텍스트 */}
            <Label className="flex items-center gap-1 text-base font-medium">
              <Tag className="h-4 w-4" />
              연구 제목 <span className="text-destructive text-xs">*</span>
            </Label>

            {/* 오른쪽: 공개/비공개 스위치 */}
            <div className="flex items-center gap-2">
              <Switch
                id="is-public"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
              <span className="text-muted-foreground text-sm">비공개 여부</span>
            </div>
          </div>

          <Input
            id="title"
            placeholder="연구 제목을 입력하세요"
            {...register('title')}
            className="focus-visible:none rounded-none border-0 border-b px-0 !text-xl font-medium shadow-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {errors.title && (
            <p className="text-destructive mt-2 text-sm">
              {errors.title.message as string}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 연구 분야 */}
          <div className="space-y-3">
            <Label className="flex items-center text-base font-medium">
              <SquareLibrary className="h-4 w-4" />
              연구 분야 <span className="text-destructive text-xs">*</span>
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

          {/* 연구 기간 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center text-base font-medium">
                <CalendarIcon className="h-4 w-4" />
                연구 기간 <span className="text-destructive text-xs">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="status"
                  type="checkbox"
                  checked={isWaiting}
                  onChange={(e) => setIsWaiting(e.target.checked)}
                  className="focus:none text-muted-foreground"
                />

                <Label
                  className="text-muted-foreground text-sm font-normal"
                  htmlFor="status"
                >
                  진행 대기
                </Label>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 justify-start border text-left font-normal',
                      !startDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {startDate
                      ? format(startDate, 'yyyy.MM.dd', { locale: ko })
                      : '시작일 (필수)'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span>~</span>

              {/* End Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 justify-start border text-left font-normal',
                      !endDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {endDate
                      ? format(endDate, 'yyyy.MM.dd', { locale: ko })
                      : '종료일 (선택)'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="grid grid-cols-2 gap-8">
            {/* IRB */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center text-base font-medium">
                  <ShieldCheck className="mr-1 h-4 w-4 shrink-0" />
                  IRB 번호
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 px-2 py-1"
                  onClick={() => irbInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  업로드
                </Button>
                <input
                  type="file"
                  accept="*/*"
                  ref={irbInputRef}
                  className="hidden"
                  onChange={(e) => handleUploadMultipleFiles(e, 'IRB')}
                />
              </div>
              <Input {...register('irbId')} placeholder="IRB 번호 입력" />
              {irbFiles.map((file, index) => (
                <FileItem
                  key={file.fileId}
                  file={{ name: file.fileName!, size: file.size }}
                  index={index}
                  onAction={() => handleRemoveIRBFile(index)}
                  mode="remove"
                />
              ))}
            </div>

            {/* DRB */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center text-base font-medium">
                  <ShieldCheck className="mr-1 h-4 w-4 shrink-0" />
                  DRB 번호
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 px-2 py-1"
                  onClick={() => drbInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  업로드
                </Button>
                <input
                  type="file"
                  accept="*/*"
                  ref={drbInputRef}
                  className="hidden"
                  onChange={(e) => handleUploadMultipleFiles(e, 'DRB')}
                />
              </div>
              <Input {...register('drbId')} placeholder="DRB 번호 입력" />
              {drbFiles.map((file, index) => (
                <FileItem
                  key={file.fileId}
                  file={{ name: file.fileName!, size: file.size }}
                  index={index}
                  onAction={() => handleRemoveDRBFile(index)}
                  mode="remove"
                />
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* 구성원 */}
          <div className="space-y-6">
            <h3 className="flex items-center text-base font-medium">
              <Users className="mr-2 h-4 w-4" />
              연구 구성원
            </h3>

            <div className="bg-muted space-y-3 rounded-xl p-4">
              {/* 상단 헤더: 라벨 + + 버튼 */}
              <div className="flex items-center justify-between">
                <Label className="flex items-center text-sm font-semibold">
                  <User className="h-4 w-4" />
                  PI
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  // onClick={() =>
                  //   setPiList([
                  //     ...piList,
                  //     { organization: '', department: '', name: '' },
                  //   ])
                  // }
                  onClick={() => setShowPIModal(true)}
                >
                  <Plus />
                </Button>
              </div>

              {/* 입력 리스트 */}
              {piList.map((pi, index) => (
                <div
                  key={`${pi.name}-${pi.organization}-${pi.department}-${pi.position}-${pi.position}`}
                  className="flex gap-2"
                >
                  <Input
                    disabled
                    placeholder="PI 이름"
                    value={pi.name || ''}
                    onChange={(e) => {
                      const updated = [...piList];
                      updated[index].name = e.target.value;
                      setPiList(updated);
                    }}
                    className="bg-white"
                  />
                  <Input
                    disabled
                    placeholder="PI 기관"
                    value={pi.organization || ''}
                    onChange={(e) => {
                      const updated = [...piList];
                      updated[index].organization = e.target.value;
                      setPiList(updated);
                    }}
                    className="bg-white"
                  />
                  <Input
                    disabled
                    placeholder="PI 부서"
                    value={pi.department || ''}
                    onChange={(e) => {
                      const updated = [...piList];
                      updated[index].department = e.target.value;
                      setPiList(updated);
                    }}
                    className="bg-white"
                  />
                  <Input
                    disabled
                    placeholder="PI 직책"
                    value={pi.position || ''}
                    onChange={(e) => {
                      const updated = [...piList];
                      updated[index].position = e.target.value;
                      setPiList(updated);
                    }}
                    className="bg-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setPiList(piList.filter((_, i) => i !== index))
                    }
                  >
                    <Minus />
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-muted space-y-3 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center text-sm font-semibold">
                  <User className="h-4 w-4" />
                  참여 교수
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  // onClick={() =>
                  //   setPracticalProfessors([
                  //     ...practicalProfessors,
                  //     { organization: '', department: '', name: '' },
                  //   ])
                  // }
                  onClick={() => setShowProfessorModal(true)}
                >
                  <Plus />
                </Button>
              </div>

              {practicalProfessors.map((prof, index) => (
                <div
                  key={`${prof.name}-${prof.organization}-${prof.department}-${prof.position}`}
                  className="flex items-center gap-2"
                >
                  <Input
                    disabled
                    placeholder="참여교수 이름"
                    value={prof.name || ''}
                    onChange={(e) => {
                      const updated = [...practicalProfessors];
                      updated[index].name = e.target.value;
                      setPracticalProfessors(updated);
                    }}
                    className="bg-white"
                  />
                  <Input
                    disabled
                    placeholder="참여교수 기관"
                    value={prof.organization || ''}
                    onChange={(e) => {
                      const updated = [...practicalProfessors];
                      updated[index].organization = e.target.value;
                      setPracticalProfessors(updated);
                    }}
                    className="bg-white"
                  />
                  <Input
                    disabled
                    placeholder="참여교수 부서"
                    value={prof.department || ''}
                    onChange={(e) => {
                      const updated = [...practicalProfessors];
                      updated[index].department = e.target.value;
                      setPracticalProfessors(updated);
                    }}
                    className="bg-white"
                  />
                  <Input
                    disabled
                    placeholder="참여교수 직책"
                    value={prof.position || ''}
                    onChange={(e) => {
                      const updated = [...practicalProfessors];
                      updated[index].position = e.target.value;
                      setPracticalProfessors(updated);
                    }}
                    className="bg-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setPracticalProfessors(
                        practicalProfessors.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Minus />
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-muted space-y-3 rounded-xl p-4">
              <Label className="flex items-center text-sm font-semibold">
                <Users className="h-4 w-4" />
                실무 책임자 <span className="text-destructive text-xs">*</span>
              </Label>

              <UserTagInput
                selectedUsers={leaders}
                onChange={(userIds) => setLeaders(userIds)}
                placeholder="실무 책임자 이름을 입력하세요"
                excludeUsers={participants}
              />
            </div>

            <div className="bg-muted space-y-3 rounded-xl p-4">
              <Label className="flex items-center text-sm font-semibold">
                <Users className="h-4 w-4" />
                실무 연구자
              </Label>

              <UserTagInput
                selectedUsers={participants}
                onChange={(userIds) => setParticipants(userIds)}
                placeholder="실무 연구자 이름을 입력하세요"
                excludeUsers={leaders}
              />
            </div>
          </div>

          <Separator className="my-6" />

          {/* 연구 내용 */}
          <div className="space-y-4">
            <Label
              htmlFor="content"
              className="flex items-center text-base font-medium"
            >
              <NotepadText className="h-4 w-4" />
              연구 내용 <span className="text-destructive text-xs">*</span>
            </Label>
            <MarkdownEditor
              content={watch('content') ?? ''}
              setContent={(val) => setValue('content', val)}
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

      {/* PI 선택 모달 */}
      <ExternalProfessorSelectModal
        open={showPIModal}
        onClose={() => setShowPIModal(false)}
        onSelect={(prof) => {
          setPiList([...piList, prof]);
          setShowPIModal(false);
        }}
        selectedProfessorKeys={selectedPiKeys}
      />

      {/* 참여 교수 선택 모달 */}
      <ExternalProfessorSelectModal
        open={showProfessorModal}
        onClose={() => setShowProfessorModal(false)}
        onSelect={(prof) => {
          setPracticalProfessors([...practicalProfessors, prof]);
          setShowProfessorModal(false);
        }}
        selectedProfessorKeys={selectedPracticalKeys}
      />
    </form>
  );
}
