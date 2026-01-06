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
import { Badge } from '@/components/ui/badge';

// 제공된 JSON 양식에 맞춘 내부 타입 정의
interface PaperData {
  id: number;
  acceptDate: string;
  publishDate: string;
  journal: {
    id: number;
    journalName: string;
    category: string;
    publisher: string;
    publishCountry: string;
  };
  paperTitle: string;
  allAuthors: string;
  authorCount: number;
  correspondingAuthors: Array<{
    externalProfessorId: number;
    externalProfessorName: string;
    role: string;
  }>;
  paperAuthors: Array<{
    userId: number;
    userName: string;
    role: string;
  }>;
  vol: string;
  page: string;
  paperLink: string;
  doi: string;
  pmid: string;
  citations: number;
  professorRole: string;
  isRepresentative: boolean;
  files: Array<{
    fileId: string;
    fileName: string;
    uploadUrl: string;
  }>;
}

interface PaperTableProps {
  data: PaperData[];
  onEdit: (item: PaperData, type: string) => void;
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
      item.correspondingAuthors
        ?.map((a) => a.externalProfessorName)
        .join(', ') ?? '';
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
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="논문 검색..."
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
            <SelectItem value="asc">과거순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Publish/Accept</TableHead>
              <TableHead>저널명</TableHead>
              <TableHead className="min-w-[200px]">논문 제목</TableHead>
              <TableHead>전체 저자</TableHead>
              <TableHead>교신저자</TableHead>
              {!isUserView && <TableHead>인원</TableHead>}
              <TableHead>Vol/Page</TableHead>
              <TableHead>DOI/PMID</TableHead>
              <TableHead className="text-center">첨부</TableHead>
              {!isUserView && (
                <TableHead className="text-center">대표</TableHead>
              )}
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedData.map((item, idx) => {
              const correspondingNames =
                item.correspondingAuthors
                  ?.map((a) => a.externalProfessorName)
                  .join(', ') ?? '-';
              const labMembers =
                item.paperAuthors
                  ?.map((a) => `${a.userName}(${a.role})`)
                  .join(', ') ?? '-';

              return (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell className="text-xs">
                    P: {item.publishDate}
                    <br />
                    A: {item.acceptDate}
                  </TableCell>
                  <TableCell>{item.journal?.journalName}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.paperTitle}</div>
                    {/* 링크 노출 및 말줄임 처리 */}
                    {item.paperLink && (
                      <div className="max-w-[250px] truncate">
                        <a
                          href={item.paperLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs underline"
                          title={item.paperLink}
                        >
                          {item.paperLink}
                        </a>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-xs">
                    {item.allAuthors}
                  </TableCell>
                  <TableCell className="text-xs">
                    {correspondingNames}
                  </TableCell>

                  {!isUserView && (
                    <TableCell className="text-xs">
                      총 {item.authorCount}명<br />
                      <span className="text-muted-foreground">
                        {labMembers}
                      </span>
                    </TableCell>
                  )}

                  <TableCell className="text-xs">
                    {item.vol || '-'}/{item.page || '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    D: {item.doi || '-'}
                    <br />
                    P: {item.pmid || '-'}
                  </TableCell>

                  <TableCell className="text-center">
                    {(item.files?.length ?? 0) > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
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

                  {!isUserView && (
                    <TableCell className="text-center">
                      {item.isRepresentative && (
                        <Badge variant="default">대표</Badge>
                      )}
                      <div className="mt-1 text-[10px]">
                        {item.professorRole}
                      </div>
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
                        <DropdownMenuItem onClick={() => onEdit(item, 'paper')}>
                          <Pencil className="mr-2 h-4 w-4" /> 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(String(item.id), 'paper')}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> 삭제
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
