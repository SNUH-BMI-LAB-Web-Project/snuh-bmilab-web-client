'use client';

import { useState, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// TODO: 백엔드 필터링 옵션 연결

interface ReportFilter {
  user?: string;
  project?: string;
}

interface FilterControlsProps {
  onFilter: (filters: ReportFilter) => void;
  showUserFilter?: boolean;
}

export function FilterControls({
  onFilter,
  showUserFilter = true,
}: FilterControlsProps) {
  const [user, setUser] = useState('');
  const [project, setProject] = useState('');

  // 실제 구현에서는 API에서 데이터 가져오기
  const users = [
    { id: '1', name: '홍길동' },
    { id: '2', name: '김철수' },
    { id: '3', name: '이영희' },
  ];

  // 프로젝트 목록
  const projects = [
    { id: '1', name: '웹사이트 리뉴얼' },
    { id: '2', name: '모바일 앱 개발' },
    { id: '3', name: '마케팅 캠페인' },
  ];

  // 필터 변경 핸들러
  const handleUserChange = useCallback(
    (value: string) => {
      setUser(value);
      onFilter({ user: value, project });
    },
    [project, onFilter],
  );

  const handleProjectChange = useCallback(
    (value: string) => {
      setProject(value);
      onFilter({ user, project: value });
    },
    [user, onFilter],
  );

  const handleReset = useCallback(() => {
    setUser('');
    setProject('');
    onFilter({ user: '', project: '' });
  }, [onFilter]);

  return (
    <div className="space-y-4">
      <div
        className={`grid ${showUserFilter ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}
      >
        {showUserFilter && (
          <div className="space-y-2">
            <Label htmlFor="user">사용자</Label>
            <Select value={user} onValueChange={handleUserChange}>
              <SelectTrigger id="user">
                <SelectValue placeholder="모든 사용자" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 사용자</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="project">프로젝트</Label>
          <Select value={project} onValueChange={handleProjectChange}>
            <SelectTrigger id="project">
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

      <div className="flex justify-end">
        <Button variant="ghost" onClick={handleReset} className="h-10 px-2">
          <X className="mr-1 h-4 w-4" />
          초기화
        </Button>
      </div>
    </div>
  );
}
