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

// API 응답 양식에 맞춘 내부 타입 정의 (또는 lib/types.ts 수정)
interface BookData {
  id: number;
  authors: string;
  authorType: string;
  publicationDate: string;
  publicationHouse: string;
  publisher: string;
  publicationName: string;
  title: string;
  isbn: string;
}

interface BookTableProps {
  data: BookData[];
  onEdit: (item: BookData) => void;
  onDelete?: (id: string) => void;
}

type SortOrder = 'asc' | 'desc';

export function BookTable({ data, onEdit, onDelete }: BookTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    if (searchColumn === 'all') {
      return (
        item.publicationDate?.toLowerCase().includes(q) ||
        item.authors?.toLowerCase().includes(q) ||
        item.publisher?.toLowerCase().includes(q) ||
        item.publicationHouse?.toLowerCase().includes(q) ||
        item.publicationName?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.isbn?.toLowerCase().includes(q)
      );
    }

    const value = item[searchColumn as keyof BookData];
    return String(value ?? '')
      .toLowerCase()
      .includes(q);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a.publicationDate ?? '';
    const bValue = b.publicationDate ?? '';
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
            <SelectItem value="publicationDate">출판일</SelectItem>
            <SelectItem value="authors">저자</SelectItem>
            <SelectItem value="publisher">발행처</SelectItem>
            <SelectItem value="publicationHouse">출판사</SelectItem>
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

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No</TableHead>
              <TableHead className="text-center">출판일</TableHead>
              <TableHead>저자</TableHead>
              <TableHead>발행처</TableHead>
              <TableHead>출판사</TableHead>
              <TableHead>출판물명</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>ISBN</TableHead>
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
              sortedData.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell className="text-center">
                    {item.publicationDate}
                  </TableCell>
                  <TableCell>{item.authors}</TableCell>
                  <TableCell>{item.publisher}</TableCell>
                  <TableCell>{item.publicationHouse}</TableCell>
                  <TableCell>{item.publicationName}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.isbn}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" /> 수정
                        </DropdownMenuItem>
                        {onDelete && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(String(item.id))}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> 삭제
                          </DropdownMenuItem>
                        )}
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
