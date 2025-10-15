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

  const getToken = () => {
    try {
      const raw = localStorage.getItem('auth-storage');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed.state === 'string')
        parsed.state = JSON.parse(parsed.state);
      return (
        parsed.state?.accessToken ||
        parsed.state?.auth?.accessToken ||
        parsed.accessToken ||
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
      const uploaded: FileMeta[] = [];

      for (const file of Array.from(selectedFiles)) {
        const presRes = await fetch(
          `${API_BASE}/files/presigned-url?fileName=${encodeURIComponent(
            file.name,
          )}&contentType=${encodeURIComponent(file.type)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!presRes.ok) throw new Error('Presigned URL 요청 실패');

        const presJson = await presRes.json();
        const uuid = presJson.uuid ?? presJson.fileId ?? presJson.id;
        const presignedUrl = presJson.presignedUrl ?? presJson.url;
        if (!uuid || !presignedUrl) throw new Error('Presigned 응답 오류');

        const s3Res = await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        if (!s3Res.ok) throw new Error('S3 업로드 실패');

        const saveRes = await fetch(`${API_BASE}/files`, {
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
        if (!saveRes.ok) throw new Error('파일 저장 실패');

        const saved = await saveRes.json();
        uploaded.push({
          fileId: saved.fileId ?? saved.id ?? saved.uuid,
          fileName: saved.fileName ?? file.name,
          size: saved.size ?? file.size,
          uploadUrl: saved.uploadUrl ?? saved.url,
        });
      }

      const existingIds = (files || []).map((f) => f.fileId);
      const allIds = [...existingIds, ...uploaded.map((u) => u.fileId)];

      const patchRes = await fetch(
        `${API_BASE}/tasks/${taskId}/periods/${periodId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ yearlyFileIds: allIds }),
        },
      );
      if (!patchRes.ok) throw new Error('파일 연결 실패');

      const newFiles = [...(files || []), ...uploaded];
      onChange?.(newFiles);
    } catch (err: any) {
      alert(`업로드 실패: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!taskId || !periodId) return;
    const token = getToken();
    if (!token) return alert('로그인이 필요합니다.');

    const res = await fetch(`${API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return alert('삭제 실패');

    const updated = (files || []).filter((f) => f.fileId !== fileId);

    const patchRes = await fetch(
      `${API_BASE}/tasks/${taskId}/periods/${periodId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ yearlyFileIds: updated.map((f) => f.fileId) }),
      },
    );
    if (!patchRes.ok) return alert('파일 연결 해제 실패');

    onChange?.(updated);
  };

  const handleDownload = async (file: FileMeta) => {
    if (!file.uploadUrl) return;
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
