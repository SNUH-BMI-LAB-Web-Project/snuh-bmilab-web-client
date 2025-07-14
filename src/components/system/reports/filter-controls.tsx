'use client';

import React, { useEffect, useState, useCallback } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import {
  ProjectApi,
  SearchProjectItem,
  UserApi,
  UserSummary,
} from '@/generated-api';
import { Input } from '@/components/ui/input';
import { getApiConfig } from '@/lib/config';

const projectApi = new ProjectApi(getApiConfig());

const userApi = new UserApi(getApiConfig());

interface RawFilter {
  user: string;
  project: string;
  dateRange?: DateRange;
  searchQuery: string;
}

interface FilterControlsProps {
  onFilter: (filters: RawFilter) => void;
  showUserFilter?: boolean;
  showDateFilter?: boolean;
  showSearchFilter?: boolean;
}

export function FilterControls({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFilter = (filters: RawFilter) => {},
  showUserFilter = true,
  showDateFilter = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showSearchFilter = true,
}: FilterControlsProps) {
  const [user, setUser] = useState('');
  const [project, setProject] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // 프로젝트 목록
  const [projects, setProjects] = useState<SearchProjectItem[]>([]);

  // 유저 목록
  const [users, setUsers] = useState<UserSummary[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectApi.searchProject({ all: true });
        setProjects(
          res.projects?.map((proj) => ({
            projectId: proj.projectId,
            title: proj.title ?? '제목 없음',
          })) ?? [],
        );
      } catch (error) {
        console.error('프로젝트 목록 불러오기 실패:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await userApi.searchUsers();
        setUsers(
          res.users?.map((u) => ({
            userId: u.userId,
            name: u.name,
          })) ?? [],
        );
      } catch (error) {
        console.error('유저 목록 불러오기 실패:', error);
      }
    };

    fetchProjects();
    fetchUsers();
  }, []);

  // 검색 실행
  const handleSearch = useCallback(() => {
    const filters = {
      user: user || '',
      project: project || '',
      dateRange: dateRange || undefined,
      searchQuery: searchQuery || '',
    };
    onFilter(filters);
  }, [user, project, dateRange, searchQuery, onFilter]);

  // 초기화
  const handleReset = useCallback(() => {
    setUser('');
    setProject('');
    setDateRange(undefined);
    setSearchQuery('');
    onFilter({ user: '', project: '', dateRange: undefined, searchQuery: '' });
  }, [onFilter]);

  // Enter 키로 검색
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  const renderDateRange = () => {
    if (dateRange?.from) {
      if (dateRange.to) {
        return (
          <>
            {format(dateRange.from, 'MM/dd', { locale: ko })} -{' '}
            {format(dateRange.to, 'MM/dd', { locale: ko })}
          </>
        );
      }
      return format(dateRange.from, 'PPP', { locale: ko });
    }
    return <span>날짜 선택</span>;
  };

  return (
    <div className="space-y-4">
      {/* 상단 필터들 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 프로젝트 필터 */}
        <div className="space-y-2">
          <Label htmlFor="project">프로젝트</Label>
          <Select
            value={project || 'all'}
            onValueChange={(value) => setProject(value === 'all' ? '' : value)}
          >
            <SelectTrigger id="project" className="w-full cursor-pointer">
              <SelectValue placeholder="모든 프로젝트" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 프로젝트</SelectItem>
              {projects.map((proj) => (
                <SelectItem
                  key={proj.projectId}
                  value={String(proj.projectId)}
                  title={proj.title}
                >
                  <span className="w-[250px] truncate overflow-hidden text-start whitespace-nowrap">
                    {proj.title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 유저 필터 */}
        {showUserFilter && (
          <div className="space-y-2">
            <Label htmlFor="user">사용자</Label>
            <Select
              value={user || 'all'}
              onValueChange={(value) => setUser(value === 'all' ? '' : value)}
            >
              <SelectTrigger id="user" className="w-full cursor-pointer">
                <SelectValue placeholder="모든 사용자" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 사용자</SelectItem>
                {users.map((userItem) => (
                  <SelectItem
                    key={userItem.userId}
                    value={String(userItem.userId)}
                  >
                    {userItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 보고일자 필터 */}
        {showDateFilter && (
          <div className="space-y-2">
            <Label>보고일자</Label>
            <Popover>
              <PopoverTrigger asChild className="w-full">
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {renderDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* 하단 검색 */}
      <div className="space-y-2">
        <Label htmlFor="search">검색</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            id="search"
            placeholder="보고 내용, 사용자명, 프로젝트명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-8"
          />
        </div>
      </div>

      {/* 검색, 초기화 버튼 */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={handleReset} className="h-10 px-3">
          <X className="h-4 w-4" />
          초기화
        </Button>
        <Button onClick={handleSearch} className="h-10 px-6">
          <Search className="h-4 w-4" />
          검색
        </Button>
      </div>
    </div>
  );
}
