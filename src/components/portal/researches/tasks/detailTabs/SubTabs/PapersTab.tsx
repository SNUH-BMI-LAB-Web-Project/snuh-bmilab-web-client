'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

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
import { MoreVertical, Pencil, Trash2, Search, FileText } from 'lucide-react';
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

import { TaskApi } from '@/generated-api/apis/TaskApi';
import { getApiConfig } from '@/lib/config';

const taskApi = new TaskApi(getApiConfig());

function PapersTabContent() {
  const params = useParams();
  const taskId = useMemo(() => Number(params?.id), [params]);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');

  useEffect(() => {
    if (!taskId) return;
    const fetchPapers = async () => {
      try {
        const res = await taskApi.getTaskPapers({ taskId });
        setData(res as any);
      } catch (e) {
        console.error('[PapersTab] fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, [taskId]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      if (searchColumn === 'all') {
        return (
          item.paperTitle?.toLowerCase().includes(q) ||
          item.allAuthors?.toLowerCase().includes(q) ||
          item.journal?.journalName?.toLowerCase().includes(q)
        );
      }
      if (searchColumn === 'journalName')
        return item.journal?.journalName?.toLowerCase().includes(q);
      return String(item[searchColumn] ?? '')
        .toLowerCase()
        .includes(q);
    });
  }, [data, searchQuery, searchColumn]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const av = String(a.publishDate || '');
      const bv = String(b.publishDate || '');
      return sortOrder === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filteredData, sortOrder]);

  if (loading)
    return <div className="p-6 text-sm">데이터를 불러오는 중입니다.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={searchColumn} onValueChange={setSearchColumn}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="검색 필드" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="paperTitle">논문 제목</SelectItem>
            <SelectItem value="allAuthors">전체 저자</SelectItem>
            <SelectItem value="journalName">저널명</SelectItem>
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
          onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">최신순</SelectItem>
            <SelectItem value="asc">오래된순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card overflow-x-auto rounded-lg border">
        <Table className="min-w-[1300px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px] text-center">No</TableHead>
              <TableHead className="w-[110px]">Publish/Accept</TableHead>
              <TableHead className="w-[150px]">저널명</TableHead>
              <TableHead className="w-[250px]">논문 제목</TableHead>
              <TableHead className="w-[180px]">전체 저자</TableHead>
              <TableHead className="w-[120px]">교신저자</TableHead>
              <TableHead className="w-[100px]">Vol/Page</TableHead>
              <TableHead className="w-[150px]">DOI/PMID</TableHead>
              <TableHead className="w-[60px] text-center">첨부</TableHead>
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
              sortedData.map((item, idx) => (
                <TableRow key={item.id || idx}>
                  <TableCell className="text-center text-sm">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="text-[11px] leading-tight">
                    <div>
                      P:{' '}
                      {item.publishDate
                        ? new Date(item.publishDate).toLocaleDateString()
                        : '-'}
                    </div>
                    <div className="text-gray-400">
                      A:{' '}
                      {item.acceptDate
                        ? new Date(item.acceptDate).toLocaleDateString()
                        : '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium">
                      {item.journal?.journalName || '-'}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {item.journal?.category || ''}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm leading-snug font-semibold">
                    {item.paperTitle}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {item.allAuthors || '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.correspondingAuthors
                      ?.map(
                        (ca: any) => ca.externalProfessorName || ca.userName,
                      )
                      .join(', ') || '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>V: {item.vol || '-'}</div>
                    <div>P: {item.page || '-'}</div>
                  </TableCell>
                  <TableCell className="text-[10px] break-all">
                    <div>DOI: {item.doi || '-'}</div>
                    <div>PMID: {item.pmid || '-'}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.files?.length > 0 && (
                      <a
                        href={item.files[0].uploadUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FileText className="mx-auto h-4 w-4 text-blue-500 hover:text-blue-700" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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

export default dynamic(() => Promise.resolve(PapersTabContent), { ssr: false });
