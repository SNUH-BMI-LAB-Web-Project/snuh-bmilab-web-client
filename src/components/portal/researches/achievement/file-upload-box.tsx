'use client';

import type React from 'react';
import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { uploadFileWithPresignedUrl } from '@/lib/upload';
import { FileItem } from '@/components/common/file-item';
import type { ProjectFileSummary } from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';

interface FileUploadBoxProps {
  value: ProjectFileSummary[];
  onChange: (files: ProjectFileSummary[]) => void;
  className?: string;
}

export function FileUploadBox({
  value,
  onChange,
  className,
}: FileUploadBoxProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  /* =========================
   * 파일 업로드
   * ========================= */
  const uploadFiles = async (files: File[]) => {
    if (!files.length || !accessToken) return;

    const uploaded = await Promise.all(
      files.map((file) =>
        uploadFileWithPresignedUrl(file, accessToken)
          .then((record) => {
            toast.success(`${file.name} 업로드 완료`);
            return record;
          })
          .catch(() => null),
      ),
    );

    const validFiles = uploaded.filter(
      (f): f is ProjectFileSummary => f !== null,
    );

    onChange([...value, ...validFiles]);
  };

  /* =========================
   * input 업로드
   * ========================= */
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    await uploadFiles(files);
    e.target.value = '';
  };

  /* =========================
   * drag & drop
   * ========================= */
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  /* =========================
   * 제거
   * ========================= */
  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* 업로드 박스 */}
      <div
        className={cn(
          'flex items-center justify-center rounded-md border border-dashed p-5 text-center transition-colors',
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
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-muted-foreground flex flex-col items-center gap-2"
        >
          <div className="bg-primary/10 rounded-full p-2">
            <Plus className="text-primary h-5 w-5" />
          </div>
          <span className="text-sm font-medium">파일 추가 또는 드래그</span>
        </button>
      </div>

      {/* 파일 리스트 */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <FileItem
              key={file.fileId}
              file={{
                name: file.fileName!,
                size: file.size,
              }}
              index={index}
              onAction={() => handleRemove(index)}
              mode="remove"
            />
          ))}
        </div>
      )}
    </div>
  );
}
