'use client';

import React, { useState, useEffect } from 'react';
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

import { projectCategories } from '@/data/projects';
import { users } from '@/data/users';
import type {
  Project,
  ProjectFile,
  ProjectCategory,
  ProjectStatus,
} from '@/types/project';
import { Separator } from '@/components/ui/separator';
import { FileItem } from '@/components/researches/projects/file-item';
import { UserTagInput } from '@/components/researches/projects/user-tag-input';

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Project) => void;
  isEditing?: boolean;
}

export function ProjectForm({
  initialData,
  onSubmit,
  isEditing = false,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Project>({
    defaultValues: initialData || {
      title: '',
      content: '',
      startDate: '',
      endDate: '',
      category: '' as ProjectCategory,
      status: '' as ProjectStatus,
      createdAt: '',
      leaderId: [],
      participantId: [],
      files: [],
    },
  });

  // 날짜 선택 상태
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined,
  );

  // 책임자 및 참여자 상태
  const [leaders, setLeaders] = useState<string[]>(initialData?.leaderId || []);
  const [participants, setParticipants] = useState<string[]>(
    initialData?.participantId || [],
  );

  // 파일 상태 – 기존 파일(ProjectFile)과 새 파일(File 객체)
  const [existingFiles, setExistingFiles] = useState<ProjectFile[]>(
    initialData?.files || [],
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // 기존 파일 제거
  const removeExistingFile = (index: number) => {
    setExistingFiles(existingFiles.filter((_, i) => i !== index));
  };

  // 새 파일 제거
  const removeNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  // 폼 제출 처리 – ProjectFormData 구조에 맞게 최종 데이터 구성
  const handleFormSubmit = (formData: Project) => {
    const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    const finalData: Project = {
      ...formData,
      // 사용자가 입력한 값 외에 추가 필드 설정
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      // 편집 중이 아니라면 현재 날짜를 생성일로 지정하고, 생성자 UID는 실제 값으로 대체 필요
      createdAt: initialData?.createdAt || format(new Date(), 'yyyy-MM-dd'),
      authorId: initialData?.authorId || 'currentUserUID',
      // 파일은 기존 파일만 포함 (새 파일은 별도 업로드 후 변환 필요)
      files: existingFiles,
    };

    onSubmit(finalData);
  };

  useEffect(() => {
    if (initialData) {
      setLeaders(
        users
          .filter((u) => initialData.leaderId.includes(u.userId))
          .map((u) => u.name),
      );

      setParticipants(
        users
          .filter((u) => initialData.participantId.includes(u.userId))
          .map((u) => u.name),
      );
    }
  }, [initialData]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-8 rounded-lg border bg-white p-8 shadow-sm">
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
          <div className="space-y-3">
            <Label className="flex items-center text-base font-medium">
              <SquareLibrary className="h-4 w-4" />
              연구 분야 <span className="text-destructive text-xs">*</span>
            </Label>
            <Select
              defaultValue={initialData?.category}
              onValueChange={(value) =>
                register('category').onChange({ target: { value } })
              }
            >
              <SelectTrigger className="focus:none focus:none h-12 w-full border">
                <SelectValue placeholder="연구 분야를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {projectCategories.map((category: ProjectCategory) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                  {...register('status')}
                  className="focus:none text-muted-foreground"
                  defaultChecked={initialData?.status === '진행 대기'}
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

        <div className="space-y-6">
          {/* 제목 */}
          <h3 className="flex items-center text-base font-medium">
            <Users className="mr-2 h-4 w-4" />팀 구성원
          </h3>

          {/* 책임자 섹션 */}
          <div className="bg-muted/50 space-y-3 rounded-xl p-4">
            <Label className="flex items-center text-sm font-semibold">
              <User className="h-4 w-4" />
              책임자 <span className="text-destructive text-xs">*</span>
            </Label>

            {/* 책임자 입력 */}
            <UserTagInput
              selectedUsers={leaders}
              onChange={setLeaders}
              placeholder="책임자 이름을 입력하세요 (@태그)"
            />
          </div>

          {/* 참여자 섹션 */}
          <div className="bg-muted/50 space-y-3 rounded-xl p-4">
            <Label className="flex items-center text-sm font-semibold">
              <Users className="h-4 w-4" />
              참여자
            </Label>

            {/* 참여자 입력 */}
            <UserTagInput
              selectedUsers={participants}
              onChange={setParticipants}
              placeholder="참여자 이름을 입력하세요 (@태그)"
            />
          </div>
        </div>

        <Separator className="my-6" />

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
              <div className="grid gap-3 sm:grid-cols-2">
                {existingFiles.map((file, index) => (
                  <FileItem
                    key={file.name}
                    file={{
                      name: file.name,
                      size: file.size,
                    }}
                    index={index}
                    onAction={removeExistingFile}
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
                    key={file.name}
                    file={{
                      name: file.name,
                      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                    }}
                    index={index}
                    onAction={removeNewFile}
                    mode="remove"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <Button type="submit" className="px-10">
          {isEditing ? '저장' : '등록'}
        </Button>
      </div>
    </form>
  );
}
