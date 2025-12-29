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

interface Conference {
  id: number; // academicPresentationId
  authors: string;
  academicPresentationStartDate: string;
  academicPresentationEndDate: string;
  academicPresentationLocation: string;
  academicPresentationHost: string;
  academicPresentationName: string;
  presentationType: string;
  presentationTitle: string;
  projectId?: number;
  taskId?: number;
}

interface ConferenceTableProps {
  data: Conference[];
  onEdit: (item: Conference, type: string) => void;
  onRefresh: () => void;
}

type SortOrder = 'asc' | 'desc';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

export function ConferenceTable({
                                  data,
                                  onEdit,
                                  onRefresh,
                                }: ConferenceTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    if (searchColumn === 'all') {
      return (
        item.academicPresentationStartDate?.toLowerCase().includes(q) ||
        item.academicPresentationEndDate?.toLowerCase().includes(q) ||
        item.academicPresentationLocation?.toLowerCase().includes(q) ||
        item.academicPresentationHost?.toLowerCase().includes(q) ||
        item.academicPresentationName?.toLowerCase().includes(q) ||
        item.presentationType?.toLowerCase().includes(q) ||
        item.presentationTitle?.toLowerCase().includes(q) ||
        item.authors?.toLowerCase().includes(q)
      );
    }

    return String(item[searchColumn as keyof Conference] ?? '')
      .toLowerCase()
      .includes(q);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a.academicPresentationStartDate || '';
    const bValue = b.academicPresentationStartDate || '';
    return sortOrder === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    const token = getToken();
    if (!token) return;

    await fetch(
      `${API_BASE}/research/academic-presentations/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={searchColumn} onValueChange={setSearchColumn}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="검색 컬럼" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="academicPresentationStartDate">학회 시작일</SelectItem>
            <SelectItem value="academicPresentationEndDate">학회 종료일</SelectItem>
            <SelectItem value="academicPresentationLocation">학회 장소</SelectItem>
            <SelectItem value="academicPresentationHost">학회 주최</SelectItem>
            <SelectItem value="academicPresentationName">학회명</SelectItem>
            <SelectItem value="presentationType">발표 Type</SelectItem>
            <SelectItem value="presentationTitle">발표 제목</SelectItem>
            <SelectItem value="authors">저자</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="검색..."
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">No</TableHead>
              <TableHead className="text-center">학회 시작일</TableHead>
              <TableHead className="text-center">학회 종료일</TableHead>
              <TableHead>학회 장소</TableHead>
              <TableHead>학회 주최</TableHead>
              <TableHead>학회명</TableHead>
              <TableHead>발표 Type</TableHead>
              <TableHead>발표 제목</TableHead>
              <TableHead>저자</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="text-center">{item.academicPresentationStartDate}</TableCell>
                  <TableCell className="text-center">{item.academicPresentationEndDate}</TableCell>
                  <TableCell>{item.academicPresentationLocation}</TableCell>
                  <TableCell>{item.academicPresentationHost}</TableCell>
                  <TableCell>{item.academicPresentationName}</TableCell>
                  <TableCell>{item.presentationType}</TableCell>
                  <TableCell>{item.presentationTitle}</TableCell>
                  <TableCell>{item.authors}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item, 'conference')}>
                          <Pencil className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(item.id)}
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
