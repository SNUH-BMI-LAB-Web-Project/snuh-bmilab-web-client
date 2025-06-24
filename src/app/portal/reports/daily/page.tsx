'use client';

import { useState, useCallback, useEffect } from 'react';
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
import { Configuration, ProjectApi, SearchProjectItem } from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';

interface ReportFilter {
  user?: string;
  project?: string;
}

export default function DailyPage() {
  const [filters, setFilters] = useState<ReportFilter>({});
  const [projects, setProjects] = useState<SearchProjectItem[]>([]);

  const api = new ProjectApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => useAuthStore.getState().accessToken || '',
    }),
  );

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.searchProject({ all: true });
        setProjects(
          res.projects?.map((project) => ({
            projectId: project.projectId,
            title: project.title ?? '제목 없음',
          })) ?? [],
        );
      } catch (error) {
        console.error('프로젝트 목록 불러오기 실패:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleFilter = useCallback((newFilters: ReportFilter) => {
    setFilters(newFilters);
    console.log('필터 적용:', newFilters);
  }, []);

  const handleProjectChange = (value: string) => {
    handleFilter({
      ...filters,
      project: value === 'all' ? undefined : value,
    });
  };

  return (
    <div className="bg-muted flex flex-col space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">일일 업무 보고</h1>
        <DateRangePicker />
      </div>

      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">새 업무 보고 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportForm projectList={projects} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">업무 보고 피드</h3>

          <div className="w-1/4">
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
                    {proj.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ReportFeed filters={filters} projectList={projects} />
      </div>
    </div>
  );
}
