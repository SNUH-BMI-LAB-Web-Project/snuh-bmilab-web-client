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
import type { Book } from '@/lib/types';

interface BookTableProps {
  data: Book[];
  onEdit: (item: Book, type: string) => void;
  onDelete: (id: string, type: string) => void;
}

type SortOrder = 'asc' | 'desc';

export function BookTable({ data, onEdit, onDelete }: BookTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();

    if (searchColumn === 'all') {
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.publishDate?.toLowerCase().includes(searchLower) ||
        item.publisher?.toLowerCase().includes(searchLower) ||
        item.publishingHouse?.toLowerCase().includes(searchLower) ||
        item.publicationName?.toLowerCase().includes(searchLower) ||
        item.title?.toLowerCase().includes(searchLower) ||
        item.isbn?.toLowerCase().includes(searchLower)
      );
    }

    return item[searchColumn as keyof Book]
      ?.toString()
      .toLowerCase()
      .includes(searchLower);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a.publishDate || '';
    const bValue = b.publishDate || '';

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
            <SelectItem value="publishDate">출판일</SelectItem>
            <SelectItem value="name">이름</SelectItem>
            <SelectItem value="category">구분</SelectItem>
            <SelectItem value="publisher">발행처</SelectItem>
            <SelectItem value="publishingHouse">출판사</SelectItem>
            <SelectItem value="publicationName">출판물명</SelectItem>
            <SelectItem value="title">제목</SelectItem>
            <SelectItem value="isbn">ISBN</SelectItem>
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
              <TableHead className="w-[60px] text-center">No</TableHead>
              <TableHead className="text-center">출판일</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>구분</TableHead>
              <TableHead>발행처</TableHead>
              <TableHead>출판사</TableHead>
              <TableHead>출판물명</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead className="text-center" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
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
                    <div className="truncate" title={item.publishDate}>
                      {item.publishDate}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[120px]">
                    <div className="truncate" title={item.name}>
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[100px]">
                    <div className="truncate" title={item.category}>
                      {item.category}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="truncate" title={item.publisher}>
                      {item.publisher}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="truncate" title={item.publishingHouse}>
                      {item.publishingHouse}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate" title={item.publicationName}>
                      {item.publicationName}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <div className="truncate" title={item.title}>
                      {item.title}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="truncate" title={item.isbn}>
                      {item.isbn}
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
                        <DropdownMenuItem onClick={() => onEdit(item, 'book')}>
                          <Pencil className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(item.id, 'book')}
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
