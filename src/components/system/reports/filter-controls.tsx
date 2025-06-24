'use client';

import type React from 'react';

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
import { Input } from '@/components/ui/input';
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

interface FilterControlsProps {
  onFilter: (filters: any) => void;
  showUserFilter?: boolean;
  showDateFilter?: boolean;
  showSearchFilter?: boolean;
}

export function FilterControls({
  onFilter = (filters: any) => {},
  showUserFilter = true,
  showDateFilter = true,
  showSearchFilter = true,
}: FilterControlsProps) {
  const [user, setUser] = useState('');
  const [project, setProject] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="space-y-4">
      {/* 상단 필터들 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 프로젝트 필터 */}
        <div className="space-y-2">
          <Label htmlFor="project">프로젝트</Label>
          <Select
            value={project || 'all'}
            onValueChange={(value) => setProject(value === 'all' ? '' : value)}
          >
            <SelectTrigger id="project" className="w-full">
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

        {/* 유저 필터 */}
        {showUserFilter && (
          <div className="space-y-2">
            <Label htmlFor="user">사용자</Label>
            <Select
              value={user || 'all'}
              onValueChange={(value) => setUser(value === 'all' ? '' : value)}
            >
              <SelectTrigger id="user" className="w-full">
                <SelectValue placeholder="모든 사용자" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 사용자</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
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
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'MM/dd', { locale: ko })} -{' '}
                        {format(dateRange.to, 'MM/dd', { locale: ko })}
                      </>
                    ) : (
                      format(dateRange.from, 'PPP', { locale: ko })
                    )
                  ) : (
                    <span>날짜 선택</span>
                  )}
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
      {showSearchFilter && (
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
      )}

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
