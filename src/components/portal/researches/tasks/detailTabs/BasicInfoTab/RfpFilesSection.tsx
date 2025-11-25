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
  editData: any;
  setEditData: (updater: (prev: any) => any) => void;
  taskId: number;
}

export default function RfpFilesSection({
  isEditMode,
  editData,
  setEditData,
  taskId,
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
        parsed.state?.auth?.accessToken ||
        parsed.state?.accessToken ||
        parsed?.accessToken ||
        null
      );
    } catch {
      return null;
    }
  };

  // ------------------------------------------
  // 🔥 업로드 URL 직접 GET 방식으로 다운로드
  // ------------------------------------------
  const handleDownload = async (file: FileMeta) => {
    try {
      const res = await fetch(file.uploadUrl);
      const blob = await res.blob();

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.fileName;
      a.click();

      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error('다운로드 실패:', e);
    }
  };

  // ------------------------------------------
  // 파일 업로드
  // ------------------------------------------
  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files?.length) return;

    const token = getToken();
    if (!token) return;

    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const pres = await fetch(
            `${API_BASE}/files/presigned-url?fileName=${encodeURIComponent(
              file.name,
            )}&contentType=${encodeURIComponent(file.type)}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          const json = await pres.json();
          const { uuid } = json;
          const { presignedUrl } = json;

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

          // 🔥 여기서 백엔드가 반환하는 uploadUrl을 그대로 저장
          return {
            fileId: saved.fileId,
            fileName: saved.fileName,
            size: saved.size,
            uploadUrl: saved.uploadUrl,
          } as FileMeta;
        }),
      );

      const before = editData.rfpFiles || [];
      const allIds = [
        ...before.map((f: FileMeta) => f.fileId),
        ...uploaded.map((f) => f.fileId),
      ];

      // 연결 PATCH
      await fetch(`${API_BASE}/tasks/${taskId}/basic-info`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rfpFileIds: allIds }),
      });

      setEditData((prev) => ({
        ...prev,
        rfpFiles: [...before, ...uploaded],
      }));
    } finally {
      e.target.value = '';
    }
  };

  // ------------------------------------------
  // 파일 삭제
  // ------------------------------------------
  const handleDelete = async (fileId: string) => {
    const token = getToken();
    if (!token) return;

    await fetch(`${API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    setEditData((prev) => ({
      ...prev,
      rfpFiles: prev.rfpFiles.filter((f: FileMeta) => f.fileId !== fileId),
    }));
  };

  // ------------------------------------------
  const files = editData.rfpFiles || [];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">과제제안요구서 (RFP)</h3>

      {files.length === 0 && !isEditMode && (
        <div className="text-sm text-gray-500">등록된 파일 없음</div>
      )}

      {files.map((file: FileMeta) => (
        <div
          key={file.fileId}
          className="mb-2 flex items-center justify-between rounded-lg bg-gray-50 p-3"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{file.fileName}</span>
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
