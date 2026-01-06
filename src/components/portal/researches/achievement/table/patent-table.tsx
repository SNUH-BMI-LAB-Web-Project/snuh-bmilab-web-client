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
import type { Patent } from '@/lib/types';

interface PatentTableProps {
  data: Patent[];
  onEdit: (item: Patent, type: string) => void;
  onDelete: (id: number, type: string) => void;
}

type SortOrder = 'asc' | 'desc';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

export function PatentTable({ data, onEdit }: PatentTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/research/patents/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error('[PATENT DELETE FAILED]', await res.text());
      return;
    }

    window.location.reload();
  };

  // JSX는 그대로 두기 위해 props onDelete를 로컬에서 덮어씀
  const onDelete = handleDelete;

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();

    if (searchColumn === 'all') {
      return (
        item.applicationDate?.toLowerCase().includes(searchLower) ||
        item.applicationNumber?.toLowerCase().includes(searchLower) ||
        item.applicationName?.toLowerCase().includes(searchLower) ||
        item.allApplicants?.toLowerCase().includes(searchLower) ||
        item.labApplicants?.some((applicant) =>
          applicant.toLowerCase().includes(searchLower),
        ) ||
        item.notes?.toLowerCase().includes(searchLower) ||
        item.relatedTask?.toLowerCase().includes(searchLower) ||
        item.relatedProject?.toLowerCase().includes(searchLower)
      );
    }

    if (searchColumn === 'labApplicants') {
      return item.labApplicants?.some((applicant) =>
        applicant.toLowerCase().includes(searchLower),
      );
    }

    return item[searchColumn as keyof Patent]
      ?.toString()
      .toLowerCase()
      .includes(searchLower);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a.applicationDate || '';
    const bValue = b.applicationDate || '';

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
            <SelectItem value="applicationDate">출원일자</SelectItem>
            <SelectItem value="applicationNumber">출원번호</SelectItem>
            <SelectItem value="applicationName">출원명</SelectItem>
            <SelectItem value="allApplicants">출원인(전체)</SelectItem>
            <SelectItem value="labApplicants">출원인(연구실)</SelectItem>
            <SelectItem value="notes">비고</SelectItem>
            <SelectItem value="relatedTask">연계 과제</SelectItem>
            <SelectItem value="relatedProject">연계 프로젝트</SelectItem>
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
              <TableHead className="text-center">출원일자</TableHead>
              <TableHead>출원번호</TableHead>
              <TableHead>출원명</TableHead>
              <TableHead>출원인(전체)</TableHead>
              <TableHead>출원인(연구실)</TableHead>
              <TableHead>비고</TableHead>
              <TableHead>연계 프로젝트</TableHead>
              <TableHead>연계 과제</TableHead>
              <TableHead className="text-center">첨부파일</TableHead>
              <TableHead className="text-center" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => {
                const labApplicants =
                  item.patentAuthors?.map((a) => a.userName).join(', ') ?? '';

                return (
                  <TableRow key={item.id} className="hover:bg-primary/10">
                    <TableCell className="text-center">{index + 1}</TableCell>

                    <TableCell className="text-center">
                      <div className="truncate" title={item.applicationDate}>
                        {item.applicationDate}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="truncate" title={item.applicationNumber}>
                        {item.applicationNumber}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="truncate" title={item.patentName}>
                        {item.patentName}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="truncate" title={item.applicantsAll}>
                        {item.applicantsAll}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="truncate" title={labApplicants}>
                        {labApplicants || '-'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="truncate" title={item.remarks}>
                        {item.remarks || '-'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="truncate" title={item.projectName}>
                        {item.projectName || '-'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="truncate" title={item.taskName}>
                        {item.taskName || '-'}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {item.files?.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Download className="h-4 w-4" />
                              <span>{item.files.length}개</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.files.map((f) => (
                              <DropdownMenuItem key={f.fileId}>
                                <Download className="mr-2 h-4 w-4" />
                                {f.fileName}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(item, 'patent')}>
                            <Pencil className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(item.id, 'patent')}
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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
