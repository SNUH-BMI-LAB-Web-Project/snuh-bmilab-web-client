'use client';

import { useState, useCallback } from 'react';
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

interface ReportFilter {
  user?: string;
  project?: string;
}

const projects = [
  { id: '1', name: '웹사이트 리뉴얼' },
  { id: '2', name: '모바일 앱 개발' },
  { id: '3', name: '마케팅 캠페인' },
];

export default function DailyPage() {
  const [filters, setFilters] = useState<ReportFilter>({});

  const handleFilter = useCallback((newFilters: ReportFilter) => {
    setFilters(newFilters);
    // TODO: Api 연결
    console.log('필터 적용:', newFilters);
  }, []);

  const handleProjectChange = (value: string) => {
    // TODO: Api 연결
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
          <ReportForm />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">업무 보고 피드</h3>

          <div className="w-1/4">
            <Select onValueChange={handleProjectChange}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="모든 프로젝트" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 프로젝트</SelectItem>
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ReportFeed filters={filters} />
      </div>
    </div>
  );
}
