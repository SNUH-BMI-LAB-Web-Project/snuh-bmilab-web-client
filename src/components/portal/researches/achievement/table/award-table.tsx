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
  id: number; // awardId
  recipients: string;
  awardDate: string;
  hostInstitution: string;
  competitionName: string;
  awardName: string;
  presentationTitle: string;
  projectId?: number;
  taskId?: number;
}

interface AwardTableProps {
  data: Award[];
  onEdit: (item: Award, type: string) => void;
  onRefresh: () => void;
}

type SortOrder = 'asc' | 'desc';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

export function AwardTable({ data, onEdit, onRefresh }: AwardTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    if (searchColumn === 'all') {
      return (
        item.recipients?.toLowerCase().includes(q) ||
        item.awardName?.toLowerCase().includes(q) ||
        item.competitionName?.toLowerCase().includes(q) ||
        item.presentationTitle?.toLowerCase().includes(q) ||
        item.hostInstitution?.toLowerCase().includes(q) ||
        item.awardDate?.toLowerCase().includes(q)
      );
    }

    return String(item[searchColumn as keyof Award] ?? '')
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

  const handleDelete = async (id: number) => {
    console.log('[AWARD DELETE] 클릭됨');
    console.log('[AWARD DELETE] 전달받은 id:', id);

    if (!window.confirm('정말 삭제하시겠습니까?')) {
      console.log('[AWARD DELETE] 사용자 취소');
      return;
    }

    const token = getToken();
    console.log('[AWARD DELETE] 토큰:', token);

    if (!token) {
      console.error('[AWARD DELETE] 토큰 없음');
      return;
    }

    const url = `${API_BASE}/research/awards/${id}`;
    console.log('[AWARD DELETE] 요청 URL:', url);

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[AWARD DELETE] status:', res.status);

      const text = await res.text();
      console.log('[AWARD DELETE] response body:', text);

      if (!res.ok) {
        console.error('[AWARD DELETE] 삭제 실패');
        return;
      }

      console.log('[AWARD DELETE] 삭제 성공');
      onRefresh();
    } catch (e) {
      console.error('[AWARD DELETE] fetch 에러:', e);
    }
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
            <SelectItem value="awardDate">수상일</SelectItem>
            <SelectItem value="recipients">수상자</SelectItem>
            <SelectItem value="awardName">수상명</SelectItem>
            <SelectItem value="competitionName">대회명</SelectItem>
            <SelectItem value="presentationTitle">발표 제목</SelectItem>
            <SelectItem value="hostInstitution">주최 기관</SelectItem>
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
              <TableHead className="text-center">수상일</TableHead>
              <TableHead>수상자</TableHead>
              <TableHead>수상명</TableHead>
              <TableHead>대회명</TableHead>
              <TableHead>발표 제목</TableHead>
              <TableHead>주최 기관</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="text-center">{item.awardDate}</TableCell>
                  <TableCell>{item.recipients}</TableCell>
                  <TableCell>{item.awardName}</TableCell>
                  <TableCell>{item.competitionName}</TableCell>
                  <TableCell>{item.presentationTitle}</TableCell>
                  <TableCell>{item.hostInstitution}</TableCell>
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
