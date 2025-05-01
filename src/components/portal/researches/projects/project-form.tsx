'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { FileItem } from '@/components/portal/researches/projects/file-item';
import { UserTagInput } from '@/components/portal/researches/projects/user-tag-input';
import {
  GetAllProjectsCategoryEnum,
  ProjectDetail,
  ProjectRequest,
  ProjectRequestCategoryEnum,
} from '@/generated-api';
import { getCategoryLabel } from '@/utils/project-utils';

interface ProjectFormProps {
  initialData?: ProjectDetail;
  onCreate?: (data: ProjectRequest, newFiles: File[]) => void;
  onUpdate?: (
    data: { projectId: number; request: ProjectRequest },
    newFiles: File[],
    removedFileUrls: string[],
  ) => void;
  isEditing?: boolean;
}

export function ProjectForm({
  initialData,
  onCreate,
  onUpdate,
  isEditing = false,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectRequest>({
    defaultValues: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      category: initialData?.category ?? ('' as ProjectRequestCategoryEnum),
    },
  });

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined,
  );

  const [isWaiting, setIsWaiting] = useState<boolean>(
    initialData?.status === 'WAITING',
  );

  const [leaders, setLeaders] = useState<number[]>(
    initialData?.leaders?.map((u) => u.userId!) ?? [],
  );
  const [participants, setParticipants] = useState<number[]>(
    initialData?.participants?.map((u) => u.userId!) ?? [],
  );

  const [existingFiles, setExistingFiles] = useState<string[]>(
    initialData?.fileUrls ?? [],
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);

  const handleRemoveExistingFile = (index: number) => {
    const removed = existingFiles[index];
    setRemovedFiles((prev) => [...prev, removed]);
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // TODO: 폼 제출 시 토스트 처리
  const handleFormSubmit = (formData: ProjectRequest) => {
    const request: ProjectRequest = {
      title: formData.title,
      content: formData.content,
      leaderIds: leaders,
      participantIds: participants,
      startDate: startDate!,
      endDate: endDate ?? undefined,
      isWaiting,
      category: formData.category,
    };

    if (isEditing) {
      const projectId = (initialData as ProjectDetail)?.projectId;
      if (projectId !== undefined) {
        onUpdate?.({ projectId, request }, newFiles, removedFiles);
      } else {
        console.error('프로젝트 ID가 없습니다. 업데이트할 수 없습니다.');
      }
    } else {
      onCreate?.(request, newFiles);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-8 rounded-lg border bg-white p-8 shadow-sm">
        {/* 연구 제목 */}
        <div className="space-y-3 pt-2 pb-6">
          <Label className="flex items-center text-base font-medium">
            <Tag className="h-4 w-4" />
            연구 제목 <span className="text-destructive text-xs">*</span>
          </Label>

          <Input
            id="title"
            placeholder="연구 제목을 입력하세요"
            {...register('title', { required: '연구 제목은 필수입니다' })}
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
            <Select
              defaultValue={initialData?.category}
              onValueChange={(value) =>
                setValue('category', value as ProjectRequestCategoryEnum)
              }
            >
              <SelectTrigger className="focus:none focus:none h-12 w-full border">
                <SelectValue placeholder="연구 분야를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(GetAllProjectsCategoryEnum).map((category) => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        <Separator className="my-6" />

        {/* 구성원 */}
        <div className="space-y-6">
          <h3 className="flex items-center text-base font-medium">
            <Users className="mr-2 h-4 w-4" />팀 구성원
          </h3>

          <div className="bg-muted/50 space-y-3 rounded-xl p-4">
            <Label className="flex items-center text-sm font-semibold">
              <User className="h-4 w-4" />
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
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  setNewFiles((prev) => [
                    ...prev,
                    ...Array.from(target.files ?? []),
                  ]);
                }}
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
                'fileUrls' in initialData &&
                initialData.fileUrls &&
                initialData.fileUrls.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {initialData.fileUrls.map((url, index) => {
                      const urlObj = new URL(url);
                      const name =
                        urlObj.pathname.split('/').pop() || `파일_${index}`;
                      const sizeParam = urlObj.searchParams.get('size');
                      const size = sizeParam
                        ? `${(Number(sizeParam) / 1024 / 1024).toFixed(2)}MB`
                        : 'Unknown';

                      return (
                        <FileItem
                          key={url}
                          file={{ name, size }}
                          index={index}
                          onAction={handleRemoveExistingFile}
                          mode="download"
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
                    key={file.name}
                    file={{
                      name: file.name,
                      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
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

      {/* 버튼 */}
      <div className="mt-8 flex justify-end">
        <Button type="submit" className="px-10">
          {isEditing ? '저장' : '등록'}
        </Button>
      </div>
    </form>
  );
}
