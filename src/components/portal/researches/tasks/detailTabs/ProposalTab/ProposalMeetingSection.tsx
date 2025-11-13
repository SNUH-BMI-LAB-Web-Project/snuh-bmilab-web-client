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
  setEditData: (data: any) => void;
  taskId?: number;
}

export default function ProposalMeetingSection({
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

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files?.length || !taskId) return;
    const token = getToken();
    if (!token) return alert('로그인이 필요합니다.');

    try {
      const uploaded: FileMeta[] = [];

      for (const file of Array.from(files)) {
        const pres = await fetch(
          `${API_BASE}/files/presigned-url?fileName=${encodeURIComponent(
            file.name,
          )}&contentType=${encodeURIComponent(file.type)}`,
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

        uploaded.push({
          fileId: saved.fileId ?? saved.id ?? saved.uuid,
          fileName: saved.fileName ?? file.name,
          size: saved.size ?? file.size,
          uploadUrl: saved.uploadUrl ?? saved.url,
        });
      }

      const before =
        editData?.meetingNotesFiles?.map((f: any) => f.fileId) ?? [];
      const all = [...before, ...uploaded.map((f) => f.fileId)];

      const patch = await fetch(`${API_BASE}/tasks/${taskId}/proposal`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingNotesFileIds: all }),
      });
      if (!patch.ok) throw new Error('파일 연결 실패');

      setEditData((p: any) => ({
        ...p,
        meetingNotesFiles: [...(p.meetingNotesFiles || []), ...uploaded],
      }));
    } catch (err: any) {
      alert(`업로드 실패: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId: string) => {
    const token = getToken();
    if (!token) return alert('로그인이 필요합니다.');
    const res = await fetch(`${API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return alert('삭제 실패');
    setEditData((p: any) => ({
      ...p,
      meetingNotesFiles: (p.meetingNotesFiles || []).filter(
        (f: any) => f.fileId !== fileId,
      ),
    }));
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

  const files = editData?.meetingNotesFiles || [];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">회의록 파일</h3>
      {files.length === 0 && !isEditMode && (
        <div className="text-sm text-gray-500">등록된 파일 없음</div>
      )}
      {files.map((f: any) => (
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
