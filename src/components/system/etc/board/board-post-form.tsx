'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { FileItem } from '@/components/common/file-item';
import {
  BoardCategoryApi,
  BoardCategorySummary,
  BoardDetail,
  BoardRequest,
  FileSummary,
} from '@/generated-api';
import { uploadFileWithPresignedUrl } from '@/lib/upload';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import dynamic from 'next/dynamic';
import { getApiConfig } from '@/lib/config';

const MarkdownEditor = dynamic(
  () => import('@/components/common/markdown-editor'),
  {
    ssr: false, // 에러로 인해 SSR 방지하기 위해
  },
);

interface ProjectFormProps {
  initialData?: BoardDetail;
  onCreate?: (data: BoardRequest, newFiles: FileSummary[]) => void;
  onUpdate?: (
    data: { boardId: number; request: BoardRequest },
    newFiles: FileSummary[],
    removedFileUrls: FileSummary[],
  ) => void;
  isEditing?: boolean;
}

const categoryApi = new BoardCategoryApi(getApiConfig());

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
  } = useForm<BoardRequest>({
    mode: 'onSubmit',
    defaultValues: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      boardCategoryId: initialData?.boardCategory?.boardCategoryId ?? undefined,
    },
  });

  const [existingFiles, setExistingFiles] = useState<FileSummary[]>(
    initialData?.files ?? [],
  );
  const [newFiles, setNewFiles] = useState<FileSummary[]>([]);
  const [removedFiles, setRemovedFiles] = useState<FileSummary[]>([]);

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
        uploadFileWithPresignedUrl(file, accessToken!)
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
        (record): record is FileSummary => record !== null,
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
        uploadFileWithPresignedUrl(file, accessToken!)
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
        (record): record is FileSummary => record !== null,
      );
      setNewFiles((prev) => [...prev, ...validFiles]);
    },
    [accessToken],
  );

  const [urlToId] = useState(() => new Map<string, string>());

  const handleImageUploaded = useCallback(
    (f: {
      fileId: string;
      fileName: string;
      size: number;
      uploadUrl: string;
    }) => {
      urlToId.set(f.uploadUrl, f.fileId);
    },
    [urlToId],
  );

  const extractImageUrls = (markdown: string): string[] => {
    const urls = new Set<string>();

    // ![alt](url "title") 형태
    markdown.replace(
      /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
      (match, url: string) => {
        if (url) urls.add(url);
        return match; // 원문 유지
      },
    );

    // <img src="..."> 형태
    markdown.replace(
      /<img\b[^>]*\bsrc=(["']?)([^"'\s>]+)\1[^>]*>/gi,
      (match, _q: string, src: string) => {
        if (src) urls.add(src);
        return match; // 원문 유지
      },
    );

    return Array.from(urls);
  };

  const handleFormSubmit = async (formData: BoardRequest) => {
    const hasEmptyRequiredField =
      !formData.title?.trim() ||
      !formData.content?.trim() ||
      !formData.boardCategoryId;

    if (hasEmptyRequiredField) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    const urlsInContent = extractImageUrls(formData.content ?? '');
    const imageFileIds = urlsInContent
      .map((u) => urlToId.get(u))
      .filter((v): v is string => Boolean(v));

    const request: BoardRequest = {
      title: formData.title!,
      content: formData.content!,
      fileIds: newFiles.map((file) => file.fileId!),
      boardCategoryId: formData.boardCategoryId,
      imageFileIds,
    };

    try {
      if (isEditing) {
        const boardId = initialData?.boardId;
        if (boardId !== undefined) {
          await onUpdate?.({ boardId, request }, newFiles, removedFiles);
        } else {
          console.error('프로젝트 ID가 없음');
        }
      } else {
        await onCreate?.(request, newFiles);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const [boardCategorys, setBoardCategorys] = useState<BoardCategorySummary[]>(
    [],
  );

  useEffect(() => {
    const fetchCategorys = async () => {
      try {
        const res = await categoryApi.getAllBoardCategories();
        setBoardCategorys(res.categories ?? []);
      } catch (error) {
        console.error('카테고리 불러오기 실패:', error);
      }
    };

    fetchCategorys();
  }, []);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-8 rounded-lg border bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-8">
          {/* 카테고리 */}
          <div className="space-y-3">
            <Label className="flex items-center text-base font-medium">
              <SquareLibrary className="h-4 w-4" />
              카테고리 <span className="text-destructive text-xs">*</span>
            </Label>
            <Controller
              name="boardCategoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <div className="w-full">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                  </div>
                  <SelectContent>
                    {boardCategorys.map((cat) => (
                      <SelectItem
                        key={cat.boardCategoryId}
                        value={cat.boardCategoryId!.toString()}
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

        {/* 제목 */}
        <div className="space-y-3 pt-2">
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
              onImageUploaded={handleImageUploaded}
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
