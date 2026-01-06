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
import { MoreVertical, Pencil, Trash2, Search, Download } from 'lucide-react';
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
import type { Paper } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface PaperTableProps {
  data: Paper[];
  onEdit: (item: Paper, type: string) => void;
  onDelete: (id: string, type: string) => void;
  isUserView?: boolean;
}

export function PaperTable({
                             data,
                             onEdit,
                             onDelete,
                             isUserView = false,
                           }: PaperTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    const correspondingNames =
      item.correspondingAuthors?.map((a) => a.externalProfessorName).join(', ') ??
      '';

    const labMemberNames =
      item.paperAuthors?.map((a) => a.userName).join(', ') ?? '';

    if (searchColumn === 'all') {
      return (
        item.acceptDate?.includes(q) ||
        item.publishDate?.includes(q) ||
        item.journal?.journalName?.toLowerCase().includes(q) ||
        item.paperTitle?.toLowerCase().includes(q) ||
        item.allAuthors?.toLowerCase().includes(q) ||
        correspondingNames.toLowerCase().includes(q) ||
        labMemberNames.toLowerCase().includes(q) ||
        item.doi?.toLowerCase().includes(q)
      );
    }

    return false;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const av = a.publishDate ?? '';
    const bv = b.publishDate ?? '';
    return sortOrder === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
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

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">최신순</SelectItem>
            <SelectItem value="asc">오래된순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Publish</TableHead>
              <TableHead>Accept</TableHead>
              <TableHead>저널명</TableHead>
              <TableHead>논문 제목</TableHead>
              <TableHead>전체 저자</TableHead>
              <TableHead>교신저자</TableHead>
              {!isUserView && <TableHead>저자수</TableHead>}
              {!isUserView && <TableHead>연구실 내 인원</TableHead>}
              <TableHead>Vol</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>링크</TableHead>
              <TableHead>DOI</TableHead>
              <TableHead>PMID</TableHead>
              <TableHead>첨부</TableHead>
              <TableHead>Citation</TableHead>
              {!isUserView && <TableHead>교수님 역할</TableHead>}
              {!isUserView && <TableHead>대표</TableHead>}
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedData.map((item, idx) => {
              const correspondingNames =
                item.correspondingAuthors
                  ?.map((a) => a.externalProfessorName)
                  .join(', ') ?? '';

              const labMembers =
                item.paperAuthors
                  ?.map((a) => `${a.userName}(${a.role})`)
                  .join(', ') ?? '';

              return (
                <TableRow key={item.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.publishDate}</TableCell>
                  <TableCell>{item.acceptDate}</TableCell>
                  <TableCell>{item.journal?.journalName}</TableCell>
                  <TableCell>{item.paperTitle}</TableCell>
                  <TableCell>{item.allAuthors}</TableCell>
                  <TableCell>{correspondingNames}</TableCell>

                  {!isUserView && (
                    <TableCell className="text-center">
                      {item.authorCount}
                    </TableCell>
                  )}

                  {!isUserView && <TableCell>{labMembers}</TableCell>}

                  <TableCell>{item.vol}</TableCell>
                  <TableCell>{item.page}</TableCell>

                  <TableCell>
                    {item.paperLink && (
                      <a
                        href={item.paperLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        링크
                      </a>
                    )}
                  </TableCell>

                  <TableCell>{item.doi}</TableCell>
                  <TableCell>{item.pmid}</TableCell>

                  <TableCell>
                    {item.files?.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Download className="mr-1 h-4 w-4" />
                            {item.files.length}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {item.files.map((f) => (
                            <DropdownMenuItem
                              key={f.fileId}
                              onClick={() => window.open(f.uploadUrl)}
                            >
                              {f.fileName}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {item.citations}
                  </TableCell>

                  {!isUserView && (
                    <TableCell className="text-center">
                      {item.professorRole}
                    </TableCell>
                  )}

                  {!isUserView && (
                    <TableCell className="text-center">
                      {item.isRepresentative && (
                        <Badge variant="outline">대표</Badge>
                      )}
                    </TableCell>
                  )}

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEdit(item, 'paper')}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(String(item.id), 'paper')}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
