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

// 실제 API 응답 양식에 맞춘 타입 정의
interface PatentData {
  id: number;
  applicationDate: string;
  applicationNumber: string;
  patentName: string;
  applicantsAll: string;
  patentAuthors: Array<{
    userId: number;
    userName: string;
    role: string;
  }>;
  remarks: string;
  projectId: number;
  projectName: string;
  taskId: number;
  taskName: string;
  files: Array<{
    fileId: string;
    fileName: string;
    uploadUrl: string;
  }>;
}

interface PatentTableProps {
  data: PatentData[];
  onEdit: (item: PatentData, type: string) => void;
  onDelete: (id: number, type: string) => void;
}

type SortOrder = 'asc' | 'desc';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

export function PatentTable({ data, onEdit, onDelete }: PatentTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    const labApplicants =
      item.patentAuthors?.map((a) => a.userName).join(', ') ?? '';

    if (searchColumn === 'all') {
      return (
        item.applicationDate?.toLowerCase().includes(q) ||
        item.applicationNumber?.toLowerCase().includes(q) ||
        item.patentName?.toLowerCase().includes(q) ||
        item.applicantsAll?.toLowerCase().includes(q) ||
        labApplicants.toLowerCase().includes(q) ||
        item.remarks?.toLowerCase().includes(q) ||
        item.projectName?.toLowerCase().includes(q) ||
        item.taskName?.toLowerCase().includes(q)
      );
    }

    if (searchColumn === 'patentAuthors') {
      return labApplicants.toLowerCase().includes(q);
    }

    const value = item[searchColumn as keyof PatentData];
    return String(value ?? '')
      .toLowerCase()
      .includes(q);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a.applicationDate || '';
    const bValue = b.applicationDate || '';
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
            <SelectItem value="applicationDate">출원일자</SelectItem>
            <SelectItem value="applicationNumber">출원번호</SelectItem>
            <SelectItem value="patentName">출원명</SelectItem>
            <SelectItem value="applicantsAll">출원인(전체)</SelectItem>
            <SelectItem value="patentAuthors">출원인(연구실)</SelectItem>
            <SelectItem value="remarks">비고</SelectItem>
            <SelectItem value="projectName">연계 프로젝트</SelectItem>
            <SelectItem value="taskName">연계 과제</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="특허 검색..."
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

      <div className="bg-card overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No</TableHead>
              <TableHead className="w-[120px] text-center">출원일자</TableHead>
              <TableHead>출원번호</TableHead>
              <TableHead className="min-w-[200px]">출원명</TableHead>
              <TableHead>출원인(전체)</TableHead>
              <TableHead>출원인(연구실)</TableHead>
              <TableHead>비고</TableHead>
              <TableHead>연계 프로젝트/과제</TableHead>
              <TableHead className="text-center">첨부</TableHead>
              <TableHead className="w-[50px]" />
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
              sortedData.map((item, index) => {
                const labApplicants =
                  item.patentAuthors?.map((a) => a.userName).join(', ') ?? '-';

                return (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="text-center">
                      {item.applicationDate}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.applicationNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.patentName}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.applicantsAll}
                    </TableCell>
                    <TableCell className="text-xs">{labApplicants}</TableCell>
                    <TableCell className="text-xs">
                      {item.remarks || '-'}
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
                      {(item.files?.length ?? 0) > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.files.map((f) => (
                              <DropdownMenuItem
                                key={f.fileId}
                                onClick={() => window.open(f.uploadUrl)}
                              >
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
                          <DropdownMenuItem
                            onClick={() => onEdit(item, 'patent')}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> 수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(item.id, 'patent')}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> 삭제
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
