'use client';

import React, { useState, useCallback } from 'react';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { SingleProjectSelectInput } from '@/components/portal/researches/achievement/single-project-select-input';
import SingleUserSelectInput from '@/components/portal/researches/assignment/single-user-select-input';

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const [userId, setUserId] = useState(''); // 실제 필터 값 (id)
  const [userName, setUserName] = useState(''); // 입력/표시 값 (name)

  const [projectId, setProjectId] = useState(''); // 실제 필터 값 (id)
  const [projectTitle, setProjectTitle] = useState(''); // 입력/표시 값 (title)

  // 검색 실행
  const handleSearch = useCallback(() => {
    const filters = {
      user: userId || '',
      project: projectId || '',
      dateRange: dateRange || undefined,
      searchQuery: searchQuery || '',
    };
    onFilter(filters);
  }, [userId, projectId, dateRange, searchQuery, onFilter]);

  // 초기화
  const handleReset = useCallback(() => {
    setUserId('');
    setUserName('');
    setProjectId('');
    setProjectTitle('');
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
      <div className="grid grid-cols-1 gap-4">
        {/* 프로젝트 필터 */}
        <div className="space-y-2">
          <Label htmlFor="project">프로젝트</Label>

          <SingleProjectSelectInput
            value={projectTitle}
            onValueChange={(v) => {
              // 타이핑 중엔 제목만 바뀌고, id는 선택 시에만 세팅
              setProjectTitle(v);
              if (v.trim() === '') setProjectId(''); // 비우면 전체
            }}
            onProjectSelected={(p) => {
              if (!p) {
                setProjectId('');
                setProjectTitle('');
                return;
              }
              setProjectId(String(p.projectId));
              setProjectTitle(p.title ?? '');
            }}
            placeholder="프로젝트 검색"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 유저 필터 */}
          {showUserFilter && (
            <div className="space-y-2">
              <Label htmlFor="user">사용자</Label>

              <SingleUserSelectInput
                value={userName}
                onValueChange={(v) => {
                  setUserName(v);
                  if (v.trim() === '') setUserId(''); // 비우면 전체
                }}
                onUserSelected={(u) => {
                  if (!u) {
                    setUserId('');
                    setUserName('');
                    return;
                  }
                  setUserId(String(u.userId));
                  setUserName(u.name ?? '');
                }}
                placeholder="사용자 검색"
              />
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
