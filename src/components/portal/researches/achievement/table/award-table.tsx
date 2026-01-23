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

interface Award {
  id: number;
  recipients: string;
  awardDate: string;
  hostInstitution: string;
  competitionName: string;
  awardName: string;
  presentationTitle: string;
  projectId?: number;
  projectName?: string;
  taskId?: number;
  taskName?: string;
}

interface AwardTableProps {
  data: Award[];
  onEdit: (item: Award, type: string) => void;
  onDelete: (id: number, type: string) => void;
}

type SortOrder = 'asc' | 'desc';

export function AwardTable({ data, onEdit, onDelete }: AwardTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    if (searchColumn === 'all') {
      return (
        item.awardDate?.toLowerCase().includes(q) ||
        item.recipients?.toLowerCase().includes(q) ||
        item.awardName?.toLowerCase().includes(q) ||
        item.competitionName?.toLowerCase().includes(q) ||
        item.presentationTitle?.toLowerCase().includes(q) ||
        item.hostInstitution?.toLowerCase().includes(q) ||
        item.projectName?.toLowerCase().includes(q) ||
        item.taskName?.toLowerCase().includes(q)
      );
    }

    const value = item[searchColumn as keyof Award];
    return String(value ?? '')
      .toLowerCase()
      .includes(q);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a.awardDate || '';
    const bValue = b.awardDate || '';
    return sortOrder === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  return (
    <div className="space-y-4">
      {/* ===== 검색 / 정렬 ===== */}
      <div className="flex items-center gap-2">
        <Select value={searchColumn} onValueChange={setSearchColumn}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="검색 컬럼" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="awardDate">수상일</SelectItem>
            <SelectItem value="recipients">수상자</SelectItem>
            <SelectItem value="awardName">수상명</SelectItem>
            <SelectItem value="competitionName">대회명</SelectItem>
            <SelectItem value="presentationTitle">발표 제목</SelectItem>
            <SelectItem value="hostInstitution">주최 기관</SelectItem>
            <SelectItem value="projectName">연계 프로젝트</SelectItem>
            <SelectItem value="taskName">연계 과제</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="수상 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={sortOrder}
          onValueChange={(v) => setSortOrder(v as SortOrder)}
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

      {/* ===== 테이블 ===== */}
      <div className="bg-card overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No</TableHead>
              <TableHead className="w-[120px] text-center">수상일</TableHead>
              <TableHead>수상자</TableHead>
              <TableHead>수상명</TableHead>
              <TableHead>대회명</TableHead>
              <TableHead>발표 제목</TableHead>
              <TableHead>주최 기관</TableHead>
              <TableHead>연계 프로젝트 / 과제</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-muted-foreground h-24 text-center"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="text-center">
                    {item.awardDate}
                  </TableCell>
                  <TableCell className="text-xs">{item.recipients}</TableCell>
                  <TableCell className="font-medium">
                    {item.awardName}
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.competitionName}
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.presentationTitle}
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.hostInstitution}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="text-primary font-medium">
                      {item.projectName || '-'}
                    </div>
                    <div className="text-muted-foreground">
                      {item.taskName || '-'}
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
                        <DropdownMenuItem onClick={() => onEdit(item, 'award')}>
                          <Pencil className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(item.id, 'award')}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
