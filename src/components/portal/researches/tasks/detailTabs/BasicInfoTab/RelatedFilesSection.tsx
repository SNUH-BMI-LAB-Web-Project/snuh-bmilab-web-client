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

interface RelatedFiles {
  [key: string]: FileMeta[];
}

interface Props {
  isEditMode: boolean;
  editData: RelatedFiles;
  setEditData: (updater: (prev: RelatedFiles) => RelatedFiles) => void;
  fileType: string;
  taskId: number;
}

export default function RelatedFilesSection({
  isEditMode,
  editData,
  setEditData,
  fileType,
  taskId,
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

  const handleAddFiles = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const { files } = e.target;
    if (!files?.length) return;
    const token = getToken();
    if (!token) return;

    try {
      const uploadTasks = Array.from(files).map(async (file) => {
        const pres = await fetch(
          `${API_BASE}/files/presigned-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!pres.ok) throw new Error('Presigned URL 요청 실패');
        const json = await pres.json();
        const uuid = json.uuid ?? json.fileId ?? json.id;
        const presignedUrl = json.presignedUrl ?? json.url;
        if (!uuid || !presignedUrl) throw new Error('Presigned 응답 오류');

        const s3 = await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        if (!s3.ok) throw new Error('S3 업로드 실패');

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
        if (!save.ok) throw new Error('파일 저장 실패');
        const saved = await save.json();

        return {
          fileId: saved.fileId ?? saved.id ?? saved.uuid,
          fileName: saved.fileName ?? file.name,
          size: saved.size ?? file.size,
          uploadUrl: saved.uploadUrl ?? saved.url,
        } as FileMeta;
      });

      const uploadedResults = await Promise.all(uploadTasks);

      const beforeIds = editData?.[fileType]?.map((f) => f.fileId) ?? [];
      const allIds = [...beforeIds, ...uploadedResults.map((f) => f.fileId)];

      const patch = await fetch(`${API_BASE}/tasks/${taskId}/basic-info`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [fileType]: allIds }),
      });
      if (!patch.ok) throw new Error('파일 연결 실패');

      setEditData((prev) => ({
        ...prev,
        [fileType]: [...(prev[fileType] || []), ...uploadedResults],
      }));
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId: string): Promise<void> => {
    const token = getToken();
    if (!token) return;
    await fetch(`${API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setEditData((prev) => ({
      ...prev,
      [fileType]: (prev[fileType] || []).filter((f) => f.fileId !== fileId),
    }));
  };

  const handleDownload = async (file: FileMeta): Promise<void> => {
    const res = await fetch(file.uploadUrl);
    if (!res.ok) return;
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const files: FileMeta[] = editData?.[fileType] || [];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">관련 파일 ({fileType})</h3>

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
            <span className="text-sm text-gray-400">
              {Math.round(file.size / 1024)} KB
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(file)}
            >
              <Download className="h-4 w-4 text-blue-600" />
            </Button>
            {isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(file.fileId)}
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
