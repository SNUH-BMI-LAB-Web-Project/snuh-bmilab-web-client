'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Download } from 'lucide-react';

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

export default function MidtermReportSection({
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
      if (typeof parsed.state === 'string') parsed.state = JSON.parse(parsed.state);
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

  // 파일 추가
  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length || !taskId || !periodId) return;

    const token = getToken();
    if (!token) return alert('로그인이 필요합니다.');

    try {
      const uploadTasks = Array.from(selectedFiles).map(async (file) => {
        // presigned URL 요청
        const pres = await fetch(
          `${API_BASE}/files/presigned-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await pres.json();
        const uuid = json.uuid ?? json.fileId ?? json.id;
        const presignedUrl = json.presignedUrl ?? json.url;

        // S3 업로드
        await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        // DB 등록
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

      // 기존 파일 + 새 파일 병합
      const allFiles = [...files, ...uploaded];

      // 과제 기간에 반영
      await fetch(`${API_BASE}/tasks/${taskId}/periods/${periodId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interimReportFileIds: allFiles.map((f) => f.fileId) }),
      });

      // 상태 업데이트
      onChange?.(allFiles);
    } finally {
      e.target.value = '';
    }
  };

  // 파일 삭제
  const handleDelete = async (fileId: string) => {
    const token = getToken();
    if (!token || !taskId || !periodId) return;

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
      body: JSON.stringify({ interimReportFileIds: updated.map((f) => f.fileId) }),
    });

    onChange?.(updated);
  };

  // 파일 다운로드
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
      <h3 className="mb-4 text-lg font-semibold">중간보고서 ({year}년차)</h3>

      {files.length === 0 && !isEditMode && (
        <div className="text-sm text-gray-500">등록된 파일 없음</div>
      )}

      {files.map((file) => (
        <div
          key={file.fileId}
          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{file.fileName}</span>
            <span className="text-sm text-gray-400">{Math.round(file.size / 1024)} KB</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
              <Download className="h-4 w-4 text-blue-600" />
            </Button>
            {isEditMode && (
              <Button variant="ghost" size="sm" onClick={() => handleDelete(file.fileId)}>
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