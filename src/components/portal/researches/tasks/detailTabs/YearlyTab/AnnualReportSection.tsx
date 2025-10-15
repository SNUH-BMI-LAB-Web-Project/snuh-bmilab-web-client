'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';

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
  annualFile?: ReportFile | null;
  taskId?: number;
  periodId?: number;
  onChange?: (update: { annualFile?: ReportFile | null }) => void;
}

export default function AnnualReportSection({
  isEditMode,
  year,
  annualFile = null,
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
          body: JSON.stringify({ annualReportFileId: uploaded.fileId }),
        },
      );
      if (!patchRes.ok) throw new Error('파일 연결 실패');

      onChange?.({ annualFile: uploaded });
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
        body: JSON.stringify({ annualReportFileId: null }),
      },
    );
    if (!patchRes.ok) return alert('파일 연결 해제 실패');

    onChange?.({ annualFile: null });
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
        연차보고 <span className="text-sm text-red-600">(필수)</span>
      </h3>

      {annualFile ? (
        <div className="flex justify-between rounded-lg bg-gray-50 p-4">
          <div>
            <div className="font-medium">{annualFile.name}</div>
            <div className="text-sm text-gray-500">
              {(annualFile.size / 1024 / 1024).toFixed(1)}MB •{' '}
              {annualFile.uploadedAt} 업로드
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDownload(annualFile)}
            >
              <Download className="mr-1 h-4 w-4" />
              다운로드
            </Button>
            {isEditMode && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDelete(annualFile.fileId)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                삭제
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-between rounded-lg border border-red-200 bg-red-50 p-4">
          <span className="font-medium text-red-600">
            업로드된 파일 없음 (필수 업로드)
          </span>
          {isEditMode ? (
            <>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => inputRef.current?.click()}
              >
                파일 업로드
              </Button>
            </>
          ) : (
            <Button className="bg-red-600 text-white" disabled>
              파일 업로드
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
