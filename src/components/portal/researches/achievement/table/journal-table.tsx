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

import type { Journal } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

interface JournalTableProps {
  data: Journal[];
  onEdit: (item: Journal, type: 'journal') => void;
  onRefresh: () => void; // 🔥 삭제 후 재조회
}

type SortOrder = 'asc' | 'desc';

export function JournalTable({
                               data,
                               onEdit,
                               onRefresh,
                             }: JournalTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  /* ===============================
     DELETE /research/journals/{id}
     =============================== */
  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    const token = getToken();
    if (!token) return;

    const res = await fetch(
      `${API_BASE}/research/journals/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(`저널 삭제 실패 (${res.status})`);
    }

    onRefresh();
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
        item.category?.toLowerCase().includes(q) ||
        item.jcrRank?.toLowerCase().includes(q)
      );
    }

    return String(item[searchColumn as keyof Journal] ?? '')
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
            <SelectItem value="eissn">E-ISSN</SelectItem>
            <SelectItem value="jcrRank">JCR Rank</SelectItem>
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

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">가나다순</SelectItem>
            <SelectItem value="desc">역순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">No</TableHead>
              <TableHead>저널명</TableHead>
              <TableHead className="text-center">구분</TableHead>
              <TableHead>출판사</TableHead>
              <TableHead className="text-center">국가</TableHead>
              <TableHead className="text-center">ISSN</TableHead>
              <TableHead className="text-center">E-ISSN</TableHead>
              <TableHead className="text-center">JIF</TableHead>
              <TableHead className="text-center">JCR Rank</TableHead>
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
              sortedData.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell>{item.journalName}</TableCell>
                  <TableCell className="text-center">{item.category}</TableCell>
                  <TableCell>{item.publisher}</TableCell>
                  <TableCell className="text-center">{item.publishCountry}</TableCell>
                  <TableCell className="text-center">{item.issn || '-'}</TableCell>
                  <TableCell className="text-center">{item.eissn || '-'}</TableCell>
                  <TableCell className="text-center">{item.jif || '-'}</TableCell>
                  <TableCell className="text-center">{item.jcrRank || '-'}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item, 'journal')}>
                          <Pencil className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(item.id)}
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
