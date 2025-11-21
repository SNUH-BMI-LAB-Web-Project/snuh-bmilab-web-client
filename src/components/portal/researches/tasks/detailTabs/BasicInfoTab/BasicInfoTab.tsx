'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import BasicSection from './BasicSection';
import BusinessContactsSection from './BusinessContactsSection';
import RfpFilesSection from './RfpFilesSection';
import AnnouncementFilesSection from './AnnouncementFilesSection';
import ProjectPeriodSection from './ProjectPeriodSection';

export default function BasicInfoTab({ taskInfo }: { taskInfo?: any }) {
  const pathname = usePathname();
  const taskId = taskInfo?.id
    ? Number(taskInfo.id)
    : Number(pathname.split('/').filter(Boolean).pop());

  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [basicInfoData, setBasicInfoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const normalizeFileData = (data: any) => {
    return {
      ...data,
      rfpFiles: data.rfpFiles ?? [],
      announcementFiles: data.announcementFiles ?? [],
      rfpFileIds: data.rfpFiles?.map((f: any) => f.fileId) ?? [],
      announcementFileIds:
        data.announcementFiles?.map((f: any) => f.fileId) ?? [],
    };
  };

  const fetchBasicInfo = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const authRaw = localStorage.getItem('auth-storage');
      const token = authRaw ? JSON.parse(authRaw)?.state?.accessToken : null;
      if (!token) throw new Error('토큰이 없습니다.');

      const res = await fetch(
        `${API_BASE}/tasks/${taskId}/basic-info?t=${Date.now()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const text = await res.text();
      if (!res.ok) throw new Error(`서버 오류 (${res.status})`);

      const data = JSON.parse(text);

      const normalized = normalizeFileData(data);

      setBasicInfoData(normalized);
      setEditData(normalized);
    } catch (err: any) {
      setErrorMessage(err.message || '기본정보 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const authRaw = localStorage.getItem('auth-storage');
      const token = authRaw ? JSON.parse(authRaw)?.state?.accessToken : null;
      if (!token || !taskId) throw new Error('taskId 또는 토큰 누락');

      const payload = {
        ministry: editData.ministry ?? '',
        specializedAgency: editData.specializedAgency ?? '',
        announcementNumber: editData.announcementNumber ?? '',
        announcementStartDate: editData.announcementStartDate ?? '',
        announcementEndDate: editData.announcementEndDate ?? '',
        businessContactName: editData.businessContactName ?? '',
        businessContactDepartment: editData.businessContactDepartment ?? '',
        businessContactEmail: editData.businessContactEmail ?? '',
        businessContactPhone: editData.businessContactPhone ?? '',
        announcementLink: editData.announcementLink ?? '',
        threeFiveRule: editData.threeFiveRule ?? false,

        // 파일 저장용
        rfpFileIds: editData.rfpFiles?.map((f: any) => f.fileId) ?? [],
        announcementFileIds:
          editData.announcementFiles?.map((f: any) => f.fileId) ?? [],
      };

      const res = await fetch(`${API_BASE}/tasks/${taskId}/basic-info`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`PATCH 실패 (${res.status})`);

      toast.success('기본정보가 성공적으로 저장되었습니다.');

      setIsEditMode(false);
      await fetchBasicInfo();
    } catch (err: any) {
      toast.error(`저장 실패: ${err.message || '알 수 없는 오류'}`);
    }
  };

  useEffect(() => {
    if (!taskId) return;
    fetchBasicInfo();
  }, [taskId]);

  if (loading)
    return (
      <div className="py-10 text-center text-gray-500">
        기본정보를 불러오는 중입니다...
      </div>
    );

  if (errorMessage)
    return <div className="py-10 text-center text-red-600">{errorMessage}</div>;

  if (!basicInfoData)
    return (
      <div className="py-10 text-center text-gray-500">
        불러온 데이터가 없습니다.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        {!isEditMode ? (
          <Button
            onClick={() => setIsEditMode(true)}
            className="bg-blue-600 text-white"
          >
            수정
          </Button>
        ) : (
          <>
            <Button onClick={handleSave} className="bg-green-600 text-white">
              저장
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditMode(false);
                setEditData(basicInfoData);
              }}
            >
              취소
            </Button>
          </>
        )}
      </div>

      <BasicSection
        isEditMode={isEditMode}
        editData={editData}
        setEditData={setEditData}
        taskInfo={basicInfoData}
      />

      <BusinessContactsSection
        isEditMode={isEditMode}
        editData={editData}
        setEditData={setEditData}
        taskInfo={basicInfoData}
      />

      {/* RFP */}
      <RfpFilesSection
        isEditMode={isEditMode}
        editData={editData}
        setEditData={setEditData}
        taskId={taskId}
      />

      {/* 공고서류 전체 정보 */}
      <AnnouncementFilesSection
        isEditMode={isEditMode}
        editData={editData}
        setEditData={setEditData}
        taskId={taskId}
      />

      <ProjectPeriodSection taskInfo={basicInfoData} />
    </div>
  );
}
