'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportFeed } from '@/components/portal/report/daily/report-feed';
import { ReportForm } from '@/components/portal/report/daily/report-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/common/data-range-picker';
import { ProjectApi, ReportApi, SearchProjectItem } from '@/generated-api';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { getApiConfig } from '@/lib/config';
import { FileDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportDownloadModal } from '@/components/system/reports/report-download-modal';
import { downloadBlob, ensureLocalNoon } from '@/utils/download-file';
import { useAuthStore } from '@/store/auth-store';

interface ReportFilter {
  user?: string;
  project?: string;
}

const projectApi = new ProjectApi(getApiConfig());
const reportsApi = new ReportApi(getApiConfig());

// 일일업무보고 다운로드 파일 타입(엑셀, 워드)
type DownloadKind = 'excel' | 'word';

export default function DailyPage() {
  const [filters, setFilters] = useState<ReportFilter>({});
  const [projects, setProjects] = useState<SearchProjectItem[]>([]);
  const [startDate, setStartDate] = useState<Date>(() =>
    subDays(new Date(), 7),
  );
  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [fileDownloadModalOpen, setFileDownloadModalOpen] = useState(false);
  const [downloadKind, setDownloadKind] = useState<DownloadKind>('excel');

  const handleReportCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const userName = useAuthStore((s) => s.user?.name || '사용자');
  const safeFilename = (v: string) =>
    (v ?? '')
      .replace(/[\\/:*?"<>|]+/g, '') // 파일명 금지 문자 제거
      .replace(/\s+/g, ' ')
      .trim() || '사용자';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectApi.getMyProjects();
        setProjects(
          res.projects?.map((project) => ({
            projectId: project.projectId,
            title: project.title ?? '제목 없음',
          })) ?? [],
        );
      } catch (error) {
        console.error('내 프로젝트 목록 불러오기 실패:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleFilter = useCallback((newFilters: ReportFilter) => {
    setFilters(newFilters);
  }, []);

  const handleProjectChange = (value: string) => {
    handleFilter({
      ...filters,
      project: value === 'all' ? undefined : value,
    });
  };

  const handleDateChangeComplete = (range: DateRange) => {
    if (range.from && range.to) {
      setStartDate(range.from);
      setEndDate(range.to);
      setRefreshKey((prev) => prev + 1);
    }
  };

  // 엑셀/워드 공용 다운로드 핸들러 (종류에 따라 분기)
  const handleUserDownload = useCallback(
    async ({ from, to }: { from: Date; to: Date }) => {
      const start = ensureLocalNoon(from);
      const end = ensureLocalNoon(to);

      if (downloadKind === 'excel') {
        const blob = await reportsApi.getExcelFileByCurrentUser({
          startDate: start,
          endDate: end,
        });
        const filename = `${safeFilename(userName)}_일일 업무 보고_${format(
          start,
          'yyyy-MM-dd',
        )}~${format(end, 'yyyy-MM-dd')}.xlsx`;
        downloadBlob(blob, filename);
      } else {
        const blob = await reportsApi.getWordFileByCurrentUser({
          startDate: start,
          endDate: end,
        });
        const filename = `${safeFilename(userName)}_일일 업무 보고_${format(
          start,
          'yyyy-MM-dd',
        )}~${format(end, 'yyyy-MM-dd')}.docx`;
        downloadBlob(blob, filename);
      }
    },
    [downloadKind, userName], // userName/safeFilename 의존성 반영
  );

  return (
    <div className="bg-muted flex flex-col space-y-6 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="text-3xl font-bold">일일 업무 보고</h1>
        <DateRangePicker
          value={{ from: startDate, to: endDate }}
          onChange={(range) => {
            if (range.from) setStartDate(range.from);
            if (range.to) setEndDate(range.to);
          }}
          onChangeComplete={handleDateChangeComplete}
        />
      </div>

      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">새 업무 보고 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportForm
            projectList={projects}
            onReportCreated={handleReportCreated}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-2 lg:items-center">
          <h3 className="text-xl font-semibold">업무 보고 피드</h3>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
            <div className="w-full lg:w-64">
              <Select onValueChange={handleProjectChange}>
                <SelectTrigger className="w-full cursor-pointer bg-white">
                  <SelectValue placeholder="모든 프로젝트" />
                </SelectTrigger>
                <SelectContent className="cursor-pointer">
                  <SelectItem value="all" className="cursor-pointer">
                    모든 프로젝트
                  </SelectItem>
                  {projects.map((proj) => (
                    <SelectItem
                      key={proj.projectId}
                      value={String(proj.projectId)}
                      className="cursor-pointer"
                    >
                      <span className="w-64 cursor-pointer truncate overflow-hidden text-start whitespace-nowrap">
                        {proj.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => {
                setDownloadKind('excel');
                setFileDownloadModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              엑셀 파일 다운로드
            </Button>

            <Button
              onClick={() => {
                setDownloadKind('word');
                setFileDownloadModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              워드 파일 다운로드
            </Button>
          </div>
        </div>
        <ReportFeed
          key={refreshKey}
          filters={filters}
          startDate={startDate}
          endDate={endDate}
          projectList={projects}
        />
      </div>

      <ReportDownloadModal
        open={fileDownloadModalOpen}
        onOpenChange={setFileDownloadModalOpen}
        onDownload={handleUserDownload}
        title={
          downloadKind === 'excel'
            ? '일일 업무 보고 엑셀 파일 다운로드'
            : '일일 업무 보고 워드 파일 다운로드'
        }
      />
    </div>
  );
}
