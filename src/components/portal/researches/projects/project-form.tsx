'use client';

import React, { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { FileItem } from '@/components/portal/researches/projects/file-item';
import { UserTagInput } from '@/components/portal/researches/projects/user-tag-input';
import {
  ExternalProfessorSummary,
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

interface ProjectFormProps {
  initialData?: ProjectDetail;
  onCreate?: (
    data: ProjectRequest,
    newFiles: ProjectFileSummary[],
    irbFile?: ProjectFileSummary,
    drbFile?: ProjectFileSummary,
  ) => void;
  onUpdate?: (
    data: { projectId: number; request: ProjectRequest },
    newFiles: ProjectFileSummary[],
    removedFileUrls: ProjectFileSummary[],
  ) => void;
  isEditing?: boolean;
}

// TODO: 프로젝트 수정 시 pi, 실무교수 수정 막아야 함 (readOnly)

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

  const [irbFile, setIrbFile] = useState<ProjectFileSummary | null>(null);
  const [drbFile, setDrbFile] = useState<ProjectFileSummary | null>(null);

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
            toast.error(`${file.name} 업로드 실패`);
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

  const handleSingleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'IRB' | 'DRB',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadFileWithPresignedUrl(
        file,
        accessToken!,
        GeneratePresignedUrlDomainTypeEnum.Project,
      );
      console.log('file:', file);
      console.log('file.size:', file.size);
      toast.success(`${file.name} 업로드 완료`);

      if (type === 'IRB') setIrbFile(uploaded);
      else setDrbFile(uploaded);
    } catch {
      toast.error(`${file.name} 업로드 실패`);
    } finally {
      e.target.value = '';
    }
  };

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
      startDate,
      endDate: endDate ?? undefined,
      isWaiting,
      piList,
      practicalProfessors,
      irbId: formData.irbId,
      drbId: formData.drbId,
      irbFileIds: irbFile ? [irbFile.fileId!] : [],
      drbFileIds: drbFile ? [drbFile.fileId!] : [],
      fileIds: newFiles.map((file) => file.fileId!),
      isPrivate,
    };

    try {
      if (isEditing) {
        const projectId = initialData?.projectId;
        if (projectId !== undefined) {
          await onUpdate?.({ projectId, request }, newFiles, removedFiles);
          toast.success('프로젝트가 성공적으로 수정되었습니다.');
        } else {
          console.error('프로젝트 ID가 없습니다.');
          toast.error('수정에 실패했습니다. 프로젝트 ID가 없습니다.');
        }
      } else {
        await onCreate?.(
          request,
          newFiles,
          irbFile ?? undefined,
          drbFile ?? undefined,
        );
        console.log(request.piList);
        console.log(request.practicalProfessors);
        console.log(JSON.stringify(request, null, 2));
        toast.success('프로젝트가 성공적으로 등록되었습니다.');
      }
    } catch (err) {
      console.error('프로젝트 등록 실패:', err);
      toast.error('등록 중 오류가 발생했습니다.');
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
            <p className="mt-2 text-sm text-red-500">
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
                  <ShieldCheck className="mr-1 h-4 w-4" />
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
                  onChange={(e) => handleSingleFileUpload(e, 'IRB')}
                />
              </div>
              <Input {...register('irbId')} placeholder="IRB 번호 입력" />
              {irbFile && (
                <FileItem
                  key={irbFile.fileId}
                  file={{ name: irbFile.fileName!, size: irbFile.size }}
                  index={0}
                  onAction={() => setIrbFile(null)}
                  mode="remove"
                />
              )}
            </div>

            {/* DRB */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center text-base font-medium">
                  <ShieldCheck className="mr-1 h-4 w-4" />
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
                  onChange={(e) => handleSingleFileUpload(e, 'DRB')}
                />
              </div>
              <Input {...register('drbId')} placeholder="DRB 번호 입력" />
              {drbFile && (
                <FileItem
                  key={drbFile.fileId}
                  file={{ name: drbFile.fileName!, size: drbFile.size }}
                  index={0}
                  onAction={() => setDrbFile(null)}
                  mode="remove"
                />
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* 구성원 */}
          <div className="space-y-6">
            <h3 className="flex items-center text-base font-medium">
              <Users className="mr-2 h-4 w-4" />팀 구성원
            </h3>

            <div className="bg-muted/50 space-y-3 rounded-xl p-4">
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
                  onClick={() =>
                    setPiList([
                      ...piList,
                      { organization: '', department: '', name: '' },
                    ])
                  }
                >
                  <Plus />
                </Button>
              </div>

              {/* 입력 리스트 */}
              {piList.map((pi, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="PI 소속 기관"
                    value={pi.organization || ''}
                    onChange={(e) => {
                      const updated = [...piList];
                      updated[index].organization = e.target.value;
                      setPiList(updated);
                    }}
                    className="bg-white"
                  />
                  <Input
                    placeholder="PI 소속 부서"
                    value={pi.department || ''}
                    onChange={(e) => {
                      const updated = [...piList];
                      updated[index].department = e.target.value;
                      setPiList(updated);
                    }}
                    className="bg-white"
                  />
                  <Input
                    placeholder="PI 이름"
                    value={pi.name || ''}
                    onChange={(e) => {
                      const updated = [...piList];
                      updated[index].name = e.target.value;
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

            <div className="bg-muted/50 space-y-3 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center text-sm font-semibold">
                  <User className="h-4 w-4" />
                  실무 교수
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setPracticalProfessors([
                      ...practicalProfessors,
                      { organization: '', department: '', name: '' },
                    ])
                  }
                >
                  <Plus />
                </Button>
              </div>

              {practicalProfessors.map((prof, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="실무교수 소속 기관"
                    value={prof.organization || ''}
                    onChange={(e) => {
                      const updated = [...practicalProfessors];
                      updated[index].organization = e.target.value;
                      setPracticalProfessors(updated);
                    }}
                    className="bg-white"
                  />
                  <Input
                    placeholder="실무교수 소속 부서"
                    value={prof.department || ''}
                    onChange={(e) => {
                      const updated = [...practicalProfessors];
                      updated[index].department = e.target.value;
                      setPracticalProfessors(updated);
                    }}
                    className="bg-white"
                  />
                  <Input
                    placeholder="실무교수 이름"
                    value={prof.name || ''}
                    onChange={(e) => {
                      const updated = [...practicalProfessors];
                      updated[index].name = e.target.value;
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

            <div className="bg-muted/50 space-y-3 rounded-xl p-4">
              <Label className="flex items-center text-sm font-semibold">
                <Users className="h-4 w-4" />
                책임자 <span className="text-destructive text-xs">*</span>
              </Label>

              <UserTagInput
                selectedUsers={leaders}
                onChange={(userIds) => setLeaders(userIds)}
                placeholder="책임자 이름을 입력하세요 (@태그)"
              />
            </div>

            <div className="bg-muted/50 space-y-3 rounded-xl p-4">
              <Label className="flex items-center text-sm font-semibold">
                <Users className="h-4 w-4" />
                참여자
              </Label>

              <UserTagInput
                selectedUsers={participants}
                onChange={(userIds) => setParticipants(userIds)}
                placeholder="참여자 이름을 입력하세요 (@태그)"
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
            <Textarea
              id="content"
              placeholder="연구 내용을 입력하세요"
              rows={8}
              {...register('content')}
            />
          </div>

          {/* 첨부 파일 */}
          <div className="space-y-4">
            <Label className="flex items-center text-base font-medium">
              <Paperclip className="h-4 w-4" />
              첨부파일
            </Label>

            <div className="hover:border-primary/50 rounded-md border border-2 border-dashed p-6 text-center transition-colors">
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
                {initialData &&
                  'files' in initialData &&
                  initialData.files &&
                  initialData.files.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {initialData.files.map((file, index) => {
                        return (
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
                        );
                      })}
                    </div>
                  )}
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
