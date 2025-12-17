'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, Pencil, Trash2, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Conference } from '@/lib/types';

interface ConferenceTableProps {
  data: Conference[];
  onEdit: (item: Conference, type: string) => void;
  onDelete: (id: string, type: string) => void;
}

type SortOrder = 'asc' | 'desc';

export function ConferenceTable({
  data,
  onEdit,
  onDelete,
}: ConferenceTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();

    if (searchColumn === 'all') {
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.startDate?.toLowerCase().includes(searchLower) ||
        item.endDate?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower) ||
        item.organizer?.toLowerCase().includes(searchLower) ||
        item.conferenceName?.toLowerCase().includes(searchLower) ||
        item.presentationType?.toLowerCase().includes(searchLower) ||
        item.presentationTitle?.toLowerCase().includes(searchLower) ||
        item.relatedProject?.toLowerCase().includes(searchLower) ||
        item.relatedTask?.toLowerCase().includes(searchLower)
      );
    }

    return item[searchColumn as keyof Conference]
      ?.toString()
      .toLowerCase()
      .includes(searchLower);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a.startDate || '';
    const bValue = b.startDate || '';

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={searchColumn} onValueChange={setSearchColumn}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="검색 컬럼" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="startDate">학회 시작일</SelectItem>
            <SelectItem value="endDate">학회 종료일</SelectItem>
            <SelectItem value="location">학회 장소</SelectItem>
            <SelectItem value="organizer">학회주최</SelectItem>
            <SelectItem value="conferenceName">학회명</SelectItem>
            <SelectItem value="presentationType">발표 Type</SelectItem>
            <SelectItem value="presentationTitle">발표 제목</SelectItem>
            <SelectItem value="name">이름</SelectItem>
            <SelectItem value="relatedProject">연계 프로젝트</SelectItem>
            <SelectItem value="relatedTask">연계 과제</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as SortOrder)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">최신순</SelectItem>
            <SelectItem value="asc">오래된순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[60px] text-center">No</TableHead>
              <TableHead className="text-center">학회 시작일</TableHead>
              <TableHead className="text-center">학회 종료일</TableHead>
              <TableHead>학회 장소</TableHead>
              <TableHead>학회주최</TableHead>
              <TableHead>학회명</TableHead>
              <TableHead>발표 Type</TableHead>
              <TableHead>발표 제목</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>연계 프로젝트</TableHead>
              <TableHead>연계 과제</TableHead>
              <TableHead className="text-center" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-muted-foreground h-24 text-center"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-primary/10 transition-colors"
                >
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="max-w-[120px] text-center">
                    <div className="truncate" title={item.startDate}>
                      {item.startDate}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[120px] text-center">
                    <div className="truncate" title={item.endDate}>
                      {item.endDate}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="truncate" title={item.location}>
                      {item.location}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="truncate" title={item.organizer}>
                      {item.organizer}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate" title={item.conferenceName}>
                      {item.conferenceName}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[120px]">
                    <div className="truncate" title={item.presentationType}>
                      {item.presentationType}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <div className="truncate" title={item.presentationTitle}>
                      {item.presentationTitle}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[120px]">
                    <div className="truncate" title={item.name}>
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div
                      className="truncate"
                      title={item.relatedProject || '-'}
                    >
                      {item.relatedProject || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="truncate" title={item.relatedTask || '-'}>
                      {item.relatedTask || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEdit(item, 'conference')}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(item.id, 'conference')}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="text-destructive mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
