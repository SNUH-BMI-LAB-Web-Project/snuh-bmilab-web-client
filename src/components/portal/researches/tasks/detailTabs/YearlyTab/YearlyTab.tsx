'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import YearlyTaskSection from './YearlyTaskSection';
import YearlyFileSection from './YearlyFileSection';
import MidtermReportSection from './MidtermReportSection';
import AnnualReportSection from './AnnualReportSection';

export default function YearlyTab({ taskInfo }: { taskInfo?: any }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [yearTabs, setYearTabs] = useState<
    { year: number; periodId: number }[]
  >([]);
  const [yearlyData, setYearlyData] = useState<Record<number, any>>({});

  const getToken = () => {
    const raw = localStorage.getItem('auth-storage');
    return raw ? JSON.parse(raw)?.state?.accessToken : null;
  };

  useEffect(() => {
    if (taskInfo?.id) setTaskId(Number(taskInfo.id));
    else if (typeof window !== 'undefined') {
      const id = Number(
        window.location.pathname.split('/').filter(Boolean).pop(),
      );
      if (!Number.isNaN(id)) setTaskId(id);
    }
  }, [taskInfo]);

  const fetchPeriods = async () => {
    const token = getToken();
    if (!taskId || !token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks/${taskId}/basic-info`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        },
      );
      if (!res.ok) throw new Error(`GET 실패 (${res.status})`);

      const data = await res.json();
      const periods = Array.isArray(data?.periods) ? data.periods : [];

      const tabs = periods.map((p: any) => ({
        year: Number(p.yearNumber),
        periodId: Number(p.id),
      }));
      setYearTabs(tabs);

      const fetched: Record<number, any> = {};
      for (const p of tabs) {
        const dRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks/${taskId}/periods/${p.periodId}`,
          { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
        );
        const detail = await dRes.json();
        fetched[p.year] = detail;
      }
      setYearlyData(fetched);
    } catch {}
  };

  useEffect(() => {
    if (taskId) fetchPeriods();
  }, [taskId]);

  const handleSave = async () => {
    const token = getToken();
    if (!taskId || !token) return;

    try {
      for (const { year, periodId } of yearTabs) {
        const period = yearlyData[year] || {};

        const managerId =
          period.managerId ??
          period.manager?.userId ??
          period.manager?.id ??
          null;

        const memberIds = Array.isArray(period.members)
          ? period.members.map((m: any) => m.userId)
          : [];

        const periodFileIds = Array.isArray(period.periodFiles)
          ? period.periodFiles.map((f: any) => f.fileId)
          : [];
        const interimReportFileIds = Array.isArray(period.interimReportFiles)
          ? period.interimReportFiles.map((f: any) => f.fileId)
          : [];
        const annualReportFileIds = Array.isArray(period.annualReportFiles)
          ? period.annualReportFiles.map((f: any) => f.fileId)
          : [];

        const startDate = period.startDate ?? null;
        const endDate = period.endDate ?? null;

        const body = {
          startDate,
          endDate,
          managerId,
          memberIds,
          periodFileIds,
          interimReportFileIds,
          annualReportFileIds,
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks/${taskId}/periods/${periodId}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          },
        );
        if (!res.ok) throw new Error();
      }

      await fetchPeriods();
      setIsEditMode(false);

      toast.success('저장 완료');
    } catch {
      toast.error('저장 실패');
    }
  };

  if (!taskId)
    return (
      <div className="py-10 text-center text-gray-500">
        과제 정보를 불러오는 중입니다...
      </div>
    );
  if (yearTabs.length === 0)
    return (
      <div className="py-10 text-center text-gray-500">
        표시할 연차 정보가 없습니다.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="mb-4 flex justify-end gap-2">
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
                fetchPeriods();
              }}
              className="border-gray-300 text-gray-700"
            >
              취소
            </Button>
          </>
        )}
      </div>

      <Tabs defaultValue={`year-${yearTabs[0].year}`} className="space-y-6">
        <TabsList className="flex flex-wrap rounded-lg border border-gray-200 bg-white">
          {yearTabs.map(({ year }) => (
            <TabsTrigger
              key={year}
              value={`year-${year}`}
              className="font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              {year}년차
            </TabsTrigger>
          ))}
        </TabsList>

        {yearTabs.map(({ year, periodId }) => {
          const periodData = yearlyData[year];
          return (
            <TabsContent key={year} value={`year-${year}`}>
              <div className="space-y-6">
                <YearlyTaskSection
                  isEditMode={isEditMode}
                  year={year}
                  data={periodData}
                  onChange={(updated) =>
                    setYearlyData((prev) => ({
                      ...prev,
                      [year]: { ...prev[year], ...updated },
                    }))
                  }
                />

                <YearlyFileSection
                  isEditMode={isEditMode}
                  year={year}
                  files={
                    Array.isArray(periodData?.periodFiles)
                      ? periodData.periodFiles
                      : []
                  }
                  taskId={taskId}
                  periodId={periodId}
                  onChange={(updated) =>
                    setYearlyData((prev) => ({
                      ...prev,
                      [year]: { ...prev[year], periodFiles: updated },
                    }))
                  }
                />

                <MidtermReportSection
                  isEditMode={isEditMode}
                  year={year}
                  files={
                    Array.isArray(periodData?.interimReportFiles)
                      ? periodData.interimReportFiles
                      : []
                  }
                  taskId={taskId}
                  periodId={periodId}
                  onChange={(updated) =>
                    setYearlyData((prev) => ({
                      ...prev,
                      [year]: { ...prev[year], interimReportFiles: updated },
                    }))
                  }
                />

                <AnnualReportSection
                  isEditMode={isEditMode}
                  year={year}
                  files={
                    Array.isArray(periodData?.annualReportFiles)
                      ? periodData.annualReportFiles
                      : []
                  }
                  taskId={taskId}
                  periodId={periodId}
                  onChange={(updated) =>
                    setYearlyData((prev) => ({
                      ...prev,
                      [year]: {
                        ...prev[year],
                        annualReportFiles: updated.files ?? [],
                      },
                    }))
                  }
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
