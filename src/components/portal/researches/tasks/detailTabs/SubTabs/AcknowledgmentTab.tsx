'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AcknowledgmentTab() {
  const pathname = usePathname();
  const taskId = Number(pathname.split('/').filter(Boolean).pop());
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [ackData, setAckData] = useState<{ text: string; link: string } | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempText, setTempText] = useState('');
  const [tempLink, setTempLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getAuthToken = () => {
    const authRaw = localStorage.getItem('auth-storage');
    return authRaw ? JSON.parse(authRaw)?.state?.accessToken : null;
  };

  const fetchAcknowledgement = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const token = getAuthToken();
      if (!token) throw new Error('토큰이 없습니다.');

      const res = await fetch(
        `${API_BASE}/tasks/${taskId}/acknowledgement?t=${Date.now()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!res.ok) throw new Error(`서버 오류 (${res.status})`);

      const text = await res.text();
      if (!text) {
        setAckData({ text: '', link: '' });
        setTempText('');
        setTempLink('');
        return;
      }

      const data = JSON.parse(text);
      setAckData({
        text: data.acknowledgementText || '',
        link: data.relatedLink || '',
      });
      setTempText(data.acknowledgementText || '');
      setTempLink(data.relatedLink || '');
    } catch (err: any) {
      setErrorMessage(err.message || '사사표기 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('토큰이 없습니다.');

      const res = await fetch(`${API_BASE}/tasks/${taskId}/acknowledgement`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acknowledgementText: tempText,
          relatedLink: tempLink,
        }),
      });

      if (!res.ok) throw new Error(`저장 실패 (${res.status})`);

      setIsEditMode(false);
      toast.success('사사표기가 성공적으로 저장되었습니다.');
      await fetchAcknowledgement();
    } catch (err: any) {
      toast.error(err.message || '저장 실패');
    }
  };

  useEffect(() => {
    if (!taskId) return;
    fetchAcknowledgement();
  }, [taskId]);

  if (loading)
    return (
      <div className="py-10 text-center text-gray-500">
        사사표기 정보를 불러오는 중입니다...
      </div>
    );

  if (errorMessage)
    return (
      <div className="py-10 text-center text-red-600">⚠️ {errorMessage}</div>
    );

  if (!ackData)
    return (
      <div className="py-10 text-center text-gray-500">
        불러온 데이터가 없습니다.
      </div>
    );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">사사표기</h3>
        {!isEditMode ? (
          <Button
            onClick={() => setIsEditMode(true)}
            className="bg-blue-600 text-white"
          >
            수정
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-green-600 text-white">
              저장
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditMode(false);
                setTempText(ackData.text);
                setTempLink(ackData.link);
              }}
            >
              취소
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-blue-600">
            사사표기 문구
          </label>
          {isEditMode ? (
            <Input
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              placeholder="사사표기 문구를 입력하세요"
            />
          ) : (
            <div className="rounded-lg bg-gray-50 p-4 text-gray-900">
              {ackData.text || '내용 없음'}
            </div>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-blue-600">
            관련 링크
          </label>
          {isEditMode ? (
            <Input
              value={tempLink}
              onChange={(e) => setTempLink(e.target.value)}
              placeholder="https://example.com"
            />
          ) : ackData.link ? (
            <a
              href={ackData.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {ackData.link}
            </a>
          ) : (
            <div className="text-gray-500">링크 없음</div>
          )}
        </div>
      </div>
    </div>
  );
}
