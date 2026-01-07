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

// 실제 API 응답 양식에 맞춘 내부 타입 정의
interface JournalData {
  id: number;
  journalName: string;
  category: string;
  publisher: string;
  publishCountry: string;
  isbn: string;
  issn: string;
  eissn: string;
  jif: string;
  jcrRank: string;
  issue: string;
}

interface JournalTableProps {
  data: JournalData[];
  onEdit: (item: JournalData, type: 'journal') => void;
  onDelete?: (id: string, type: 'journal') => void;
}

type SortOrder = 'asc' | 'desc';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

export function JournalTable({ data, onEdit, onDelete }: JournalTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/research/journals/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('삭제 실패');

      if (onDelete) onDelete(String(id), 'journal');
    } catch (error) {
      console.error(error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    if (searchColumn === 'all') {
      return (
        item.journalName?.toLowerCase().includes(q) ||
        item.publisher?.toLowerCase().includes(q) ||
        item.publishCountry?.toLowerCase().includes(q) ||
        item.issn?.toLowerCase().includes(q) ||
        item.eissn?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    }

    return String(item[searchColumn as keyof JournalData] ?? '')
      .toLowerCase()
      .includes(q);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a.journalName ?? '';
    const bValue = b.journalName ?? '';
    return sortOrder === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
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
            <SelectItem value="journalName">저널명</SelectItem>
            <SelectItem value="category">구분</SelectItem>
            <SelectItem value="publisher">출판사</SelectItem>
            <SelectItem value="publishCountry">국가</SelectItem>
            <SelectItem value="issn">ISSN</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="학술지 검색..."
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
            <SelectItem value="asc">이름순</SelectItem>
            <SelectItem value="desc">역순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No</TableHead>
              <TableHead>저널명</TableHead>
              <TableHead className="text-center">구분</TableHead>
              <TableHead>출판사</TableHead>
              <TableHead className="text-center">국가</TableHead>
              <TableHead className="text-center">ISSN / E-ISSN</TableHead>
              <TableHead className="text-center">JIF / Rank</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground h-24 text-center"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell className="font-medium">
                    {item.journalName}
                  </TableCell>
                  <TableCell className="text-center">{item.category}</TableCell>
                  <TableCell>{item.publisher}</TableCell>
                  <TableCell className="text-center">
                    {item.publishCountry}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {item.issn || '-'}
                    <br />
                    {item.eissn || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold">{item.jif || '-'}</span>
                    <div className="text-muted-foreground text-[10px]">
                      {item.jcrRank}
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
                          onClick={() => onEdit(item, 'journal')}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> 삭제
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
