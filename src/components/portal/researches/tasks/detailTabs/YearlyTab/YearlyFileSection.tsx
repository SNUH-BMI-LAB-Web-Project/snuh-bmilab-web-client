'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2 } from 'lucide-react';

interface FileMeta {
  fileId: string;
  fileName: string;
  size: number;
  uploadUrl: string;
}

interface Props {
  isEditMode: boolean;
  year: number | string;
  files?: FileMeta[];
  taskId?: number;
  periodId?: number;
  onChange?: (files: FileMeta[]) => void;
}

export default function YearlyFileSection({
  isEditMode,
  year,
  files = [],
  taskId,
  periodId,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getToken = (): string | null => {
    try {
      const raw = localStorage.getItem('auth-storage');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed.state === 'string')
        parsed.state = JSON.parse(parsed.state);
      return (
        parsed.state?.auth?.accessToken ||
        parsed.state?.accessToken ||
        parsed?.accessToken ||
        null
      );
    } catch {
      return null;
    }
  };

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length || !taskId || !periodId) return;
    const token = getToken();
    if (!token) return alert('로그인이 필요합니다.');

    try {
      const uploadTasks = Array.from(selectedFiles).map(async (file) => {
        const pres = await fetch(
          `${API_BASE}/files/presigned-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await pres.json();
        const uuid = json.uuid ?? json.fileId ?? json.id;
        const presignedUrl = json.presignedUrl ?? json.url;

        await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        const save = await fetch(`${API_BASE}/files`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uuid,
            fileName: file.name,
            extension: (file.name.split('.').pop() || '').toLowerCase(),
            size: file.size,
            taskId,
          }),
        });
        const saved = await save.json();
        return {
          fileId: saved.fileId ?? saved.id ?? saved.uuid,
          fileName: saved.fileName ?? file.name,
          size: saved.size ?? file.size,
          uploadUrl: saved.uploadUrl ?? saved.url,
        } as FileMeta;
      });

      const uploaded = await Promise.all(uploadTasks);
      const allIds = [
        ...files.map((f) => f.fileId),
        ...uploaded.map((u) => u.fileId),
      ];

      await fetch(`${API_BASE}/tasks/${taskId}/periods/${periodId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ periodFileIds: allIds }),
      });

      onChange?.([...files, ...uploaded]);
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId: string) => {
    const token = getToken();
    if (!taskId || !periodId || !token) return;

    await fetch(`${API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const updated = files.filter((f) => f.fileId !== fileId);
    await fetch(`${API_BASE}/tasks/${taskId}/periods/${periodId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ periodFileIds: updated.map((f) => f.fileId) }),
    });

    onChange?.(updated);
  };

  const handleDownload = async (file: FileMeta) => {
    const res = await fetch(file.uploadUrl);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">
        연차별 관련 파일 ({year}년차)
      </h3>
      {files.length === 0 && !isEditMode && (
        <div className="text-sm text-gray-500">등록된 파일 없음</div>
      )}
      {files.map((f) => (
        <div
          key={f.fileId}
          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{f.fileName}</span>
            <span className="text-sm text-gray-400">
              {Math.round(f.size / 1024)} KB
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleDownload(f)}>
              <Download className="h-4 w-4 text-blue-600" />
            </Button>
            {isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(f.fileId)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        </div>
      ))}
      {isEditMode && (
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleAddFiles}
          />
          <Button
            className="mt-3 bg-blue-600 text-white"
            onClick={() => inputRef.current?.click()}
          >
            파일 추가
          </Button>
        </>
      )}
    </div>
  );
}
