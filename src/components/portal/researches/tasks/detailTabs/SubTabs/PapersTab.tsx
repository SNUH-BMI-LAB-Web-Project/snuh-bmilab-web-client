'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

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

import { TaskApi } from '@/generated-api/apis/TaskApi';
import { getApiConfig } from '@/lib/config';

const taskApi = new TaskApi(getApiConfig());

type Paper = {
  id: number;
  acceptDate: string;
  publishDate: string;
  journal: {
    journalName: string;
    category: string;
  };
  paperTitle: string;
  allAuthors: string;
  authorCount: number;
  correspondingAuthors: {
    externalProfessorId: number;
    externalProfessorName: string;
    role: string;
  }[];
  paperAuthors: {
    userId: number;
    userName: string;
    role: string;
  }[];
  vol: string;
  page: string;
  paperLink: string;
  doi: string;
  pmid: string;
  citations: number;
  professorRole: string;
  isRepresentative: boolean;
  files: {
    fileId: string;
    fileName: string;
    uploadUrl: string;
  }[];
};

type SortOrder = 'asc' | 'desc';

export default function PapersTab() {
  const params = useParams();
  const taskId = useMemo(() => Number(params?.id), [params]);

  const [data, setData] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!taskId) return;

    const fetchPapers = async () => {
      try {
        const res = await taskApi.getTaskPapers({ taskId });
        console.log('[PapersTab] raw response:', res);
        setData(res as unknown as Paper[]);
      } catch (e) {
        console.error('[PapersTab] fetch error:', e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [taskId]);

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    const corresponding =
      item.correspondingAuthors
        ?.map((a) => a.externalProfessorName)
        .join(', ') ?? '';

    return (
      item.publishDate?.includes(q) ||
      item.acceptDate?.includes(q) ||
      item.journal?.journalName?.toLowerCase().includes(q) ||
      item.paperTitle?.toLowerCase().includes(q) ||
      item.allAuthors?.toLowerCase().includes(q) ||
      corresponding.toLowerCase().includes(q) ||
      item.doi?.toLowerCase().includes(q)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const av = a.publishDate ?? '';
    const bv = b.publishDate ?? '';
    return sortOrder === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">
        논문 정보를 불러오는 중입니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="논문 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={sortOrder}
          onValueChange={(v) => setSortOrder(v as SortOrder)}
        >
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
              <TableHead>Publish / Accept</TableHead>
              <TableHead>저널명</TableHead>
              <TableHead className="min-w-[220px]">논문 제목</TableHead>
              <TableHead>전체 저자</TableHead>
              <TableHead>교신저자</TableHead>
              <TableHead>인원</TableHead>
              <TableHead>Vol / Page</TableHead>
              <TableHead>DOI / PMID</TableHead>
              <TableHead className="text-center">첨부</TableHead>
              <TableHead className="text-center">대표</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-muted-foreground h-24 text-center"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, idx) => {
                const corresponding =
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
                      {item.paperLink && (
                        <div className="max-w-[260px] truncate">
                          <a
                            href={item.paperLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-xs underline"
                          >
                            {item.paperLink}
                          </a>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="max-w-[150px] truncate text-xs">
                      {item.allAuthors}
                    </TableCell>

                    <TableCell className="text-xs">{corresponding}</TableCell>

                    <TableCell className="text-xs">
                      총 {item.authorCount}명
                      <br />
                      <span className="text-muted-foreground">
                        {labMembers}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs">
                      {item.vol || '-'} / {item.page || '-'}
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

                    <TableCell className="text-center">
                      {item.isRepresentative && <Badge>대표</Badge>}
                      <div className="mt-1 text-[10px]">
                        {item.professorRole}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              console.log('[PapersTab] edit:', item)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              console.log('[PapersTab] delete:', item.id)
                            }
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
