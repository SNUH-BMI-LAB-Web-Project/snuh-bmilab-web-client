'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ReportFilter {
  project?: string;
}

// 실제 구현에서는 API에서 데이터 가져오기
const mockReports = [
  {
    id: '1',
    user: {
      name: '홍길동',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    project: {
      id: '1',
      name: '웹사이트 리뉴얼',
    },
    content:
      '오늘은 메인 페이지 디자인을 완료했습니다. 내일은 반응형 작업을 진행할 예정입니다.',
    files: [{ name: 'main-design.fig', url: '#' }],
    createdAt: new Date(2023, 3, 28, 14, 30),
  },
  {
    id: '2',
    user: {
      name: '홍길동',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    project: {
      id: '2',
      name: '모바일 앱 개발',
    },
    content:
      '로그인 기능 구현 완료. 회원가입 페이지 작업 중입니다. API 연동 테스트도 진행했습니다.',
    files: [],
    createdAt: new Date(2023, 3, 27, 17, 45),
  },
];

export function AdminReportFeed({ filters = {} }: { filters?: ReportFilter }) {
  const [reports, setReports] = useState(mockReports);
  const [filteredReports, setFilteredReports] = useState(mockReports);

  // 필터 변경 시 보고서 필터링
  useEffect(() => {
    let result = [...mockReports];

    if (filters.project && filters.project !== 'all') {
      result = result.filter((report) => report.project.id === filters.project);
    }

    setFilteredReports(result);
  }, [filters]);

  const handleDelete = (id: string) => {
    const updatedReports = reports.filter((report) => report.id !== id);
    setReports(updatedReports);
    setFilteredReports(
      updatedReports.filter((report) => {
        if (filters.project && filters.project !== 'all') {
          return report.project.id === filters.project;
        }
        return true;
      }),
    );
  };

  return (
    <div className="space-y-4">
      {filteredReports.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground text-center">
              조건에 맞는 보고서가 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredReports.map((report) => (
          <Card key={report.id} className="bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={report.user.avatar || '/placeholder.svg'}
                      alt={report.user.name}
                    />
                    <AvatarFallback>
                      {report.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center">
                    <p className="mr-2 text-sm font-medium">
                      {report.user.name}
                    </p>
                    <Badge variant="outline">{report.project.name}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-right text-xs font-medium">
                    {format(report.createdAt, 'yyyy년 MM월 dd일', {
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">{report.content}</p>
            </CardContent>
            {report.files.length > 0 && (
              <CardFooter className="border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  {report.files.map((file) => (
                    <Button key={file.name} variant="outline" size="sm" asChild>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Paperclip className="mr-2 h-4 w-4" />
                        {file.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardFooter>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
