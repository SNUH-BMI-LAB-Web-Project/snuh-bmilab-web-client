'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2 } from 'lucide-react';

interface ReportFile {
  fileId: string;
  name: string;
  size: number;
  uploadedAt: string;
  uploadUrl?: string;
}

interface Props {
  isEditMode: boolean;
  year: number | string;
  midtermFile?: ReportFile | null;
  taskId?: number;
  periodId?: number;
  onChange?: (update: { midtermFile?: ReportFile | null }) => void;
}

export default function MidtermReportSection({
  isEditMode,
  year,
  midtermFile = null,
  taskId,
  periodId,
  onChange,
}: Props) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const inputRef = useRef<HTMLInputElement>(null);

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

  const uploadFile = async (file: File): Promise<ReportFile> => {
    const token = getToken();
    if (!token) throw new Error('로그인이 필요합니다.');

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

    return {
      fileId: saved.fileId ?? saved.id ?? saved.uuid,
      name: saved.fileName ?? file.name,
      size: saved.size ?? file.size,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadUrl: saved.uploadUrl ?? saved.url,
    };
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files?.length || !taskId || !periodId) return;
    const token = getToken();
    if (!token) return alert('로그인이 필요합니다.');

    try {
      const file = files[0];
      const uploaded = await uploadFile(file);

      const patchRes = await fetch(
        `${API_BASE}/tasks/${taskId}/periods/${periodId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ midtermReportFileId: uploaded.fileId }),
        },
      );
      if (!patchRes.ok) throw new Error('파일 연결 실패');

      onChange?.({ midtermFile: uploaded });
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

    const patchRes = await fetch(
      `${API_BASE}/tasks/${taskId}/periods/${periodId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ midtermReportFileId: null }),
      },
    );
    if (!patchRes.ok) return alert('파일 연결 해제 실패');

    onChange?.({ midtermFile: null });
  };

  const handleDownload = async (file: ReportFile) => {
    if (!file.uploadUrl) return;
    const res = await fetch(file.uploadUrl);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">
        중간보고 파일 관리 ({year}년차)
      </h3>

      {!midtermFile && !isEditMode && (
        <div className="text-sm text-gray-500">등록된 파일 없음</div>
      )}

      {midtermFile && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{midtermFile.name}</span>
            <span className="text-sm text-gray-400">
              {(midtermFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(midtermFile)}
            >
              <Download className="h-4 w-4 text-blue-600" />
            </Button>
            {isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(midtermFile.fileId)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        </div>
      )}

      {isEditMode && (
        <>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
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
