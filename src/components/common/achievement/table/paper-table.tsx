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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Paper } from '@/lib/types';

interface PaperTableProps {
  data: Paper[];
  onEdit: (item: Paper, type: string) => void;
  onDelete: (id: string, type: string) => void;
  isUserView?: boolean; // mode prop 추가
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

    const searchLower = searchQuery.toLowerCase();

    if (searchColumn === 'all') {
      return (
        item.acceptDate?.toLowerCase().includes(searchLower) ||
        item.publishDate?.toLowerCase().includes(searchLower) ||
        item.journalName?.toLowerCase().includes(searchLower) ||
        item.paperTitle?.toLowerCase().includes(searchLower) ||
        item.allAuthors?.toLowerCase().includes(searchLower) ||
        item.labMembers?.some((member) =>
          member.toLowerCase().includes(searchLower),
        ) ||
        item.correspondingAuthor?.toLowerCase().includes(searchLower) ||
        item.vol?.toLowerCase().includes(searchLower) ||
        item.page?.toLowerCase().includes(searchLower) ||
        item.doi?.toLowerCase().includes(searchLower) ||
        item.paperLink?.toLowerCase().includes(searchLower)
      );
    }

    if (searchColumn === 'labMembers') {
      return item.labMembers?.some((member) =>
        member.toLowerCase().includes(searchLower),
      );
    }

    return item[searchColumn as keyof Paper]
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
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={searchColumn} onValueChange={setSearchColumn}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="검색 컬럼" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="acceptDate">Accept Date</SelectItem>
              <SelectItem value="publishDate">Publish Date</SelectItem>
              <SelectItem value="journalName">저널명</SelectItem>
              <SelectItem value="paperTitle">논문제목</SelectItem>
              <SelectItem value="allAuthors">전체 저자</SelectItem>
              <SelectItem value="authorCount">저자수</SelectItem>
              <SelectItem value="labMembers">연구실 내 인원</SelectItem>
              <SelectItem value="correspondingAuthor">교신저자</SelectItem>
              <SelectItem value="vol">Vol</SelectItem>
              <SelectItem value="page">Page</SelectItem>
              <SelectItem value="paperLink">논문 링크</SelectItem>
              <SelectItem value="doi">DOI</SelectItem>
              <SelectItem value="pmid">PMID</SelectItem>
              <SelectItem value="citationCount">Citation Count</SelectItem>
              <SelectItem value="professorRole">교수님 역할</SelectItem>
              <SelectItem value="isRepresentative">대표실적</SelectItem>
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
            onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
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
                <TableHead className="min-w-[60px] text-center">No</TableHead>
                <TableHead className="text-center">Publish Date</TableHead>
                <TableHead className="text-center">Accept Date</TableHead>
                <TableHead>저널명</TableHead>
                <TableHead>논문제목</TableHead>
                <TableHead>전체 저자</TableHead>
                {!isUserView && <TableHead>저자수</TableHead>}
                {!isUserView && <TableHead>연구실 내 인원</TableHead>}
                <TableHead>교신저자</TableHead>
                <TableHead className="text-center">Vol</TableHead>
                <TableHead className="text-center">Page</TableHead>
                <TableHead className="text-center">논문 링크</TableHead>
                <TableHead>DOI</TableHead>
                <TableHead>PMID</TableHead>
                <TableHead className="text-center">첨부파일</TableHead>
                <TableHead className="text-center">Citation</TableHead>
                {!isUserView && (
                  <TableHead className="text-center">교수님 역할</TableHead>
                )}
                {!isUserView && (
                  <TableHead className="text-center">대표실적</TableHead>
                )}
                <TableHead className="text-center" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={!isUserView ? 19 : 15}
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
                    <TableCell className="max-w-[120px] text-center">
                      <div className="truncate" title={item.acceptDate}>
                        {item.acceptDate}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {item.journalInfo ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* eslint-disable-next-line react/button-has-type */}
                              <button className="text-primary w-full cursor-help truncate text-left hover:underline">
                                {item.journalName}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              className="text-foreground max-w-md border bg-white p-4 shadow-lg"
                              sideOffset={5}
                            >
                              <div className="space-y-2">
                                <div className="text-base font-semibold">
                                  {item.journalInfo.name}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      분류:
                                    </span>
                                    <span className="ml-2">
                                      {item.journalInfo.category}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      출판사:
                                    </span>{' '}
                                    {item.journalInfo.publisher}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      국가:
                                    </span>{' '}
                                    {item.journalInfo.country}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      JIF:
                                    </span>{' '}
                                    {item.journalInfo.jif}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      ISSN:
                                    </span>{' '}
                                    {item.journalInfo.issn}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      eISSN:
                                    </span>{' '}
                                    {item.journalInfo.eissn}
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">
                                      JCR Rank:
                                    </span>{' '}
                                    {item.journalInfo.jcrRank}
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="truncate" title={item.journalName}>
                          {item.journalName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="truncate" title={item.paperTitle}>
                        {item.paperTitle}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate" title={item.allAuthors}>
                        {(() => {
                          const firstAuthorsList =
                            item.firstAuthors
                              ?.split(',')
                              .map((s) => s.trim())
                              .filter(Boolean) || [];
                          const coAuthorsList =
                            item.coAuthors
                              ?.split(',')
                              .map((s) => s.trim())
                              .filter(Boolean) || [];

                          if (firstAuthorsList.length === 0)
                            return item.allAuthors;

                          const displayAuthors = firstAuthorsList.join(', ');
                          const coAuthorCount = coAuthorsList.length;

                          if (coAuthorCount > 0) {
                            return `${displayAuthors} 외 ${coAuthorCount}명`;
                          }
                          return displayAuthors;
                        })()}
                      </div>
                    </TableCell>
                    {!isUserView && (
                      <TableCell className="max-w-[100px] text-center">
                        {item.authorCount}명
                      </TableCell>
                    )}
                    {!isUserView && (
                      <TableCell className="max-w-[150px]">
                        <div
                          className="truncate"
                          title={item.labMembers.join(', ')}
                        >
                          {item.labMembers.join(', ')}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="max-w-[120px]">
                      <div
                        className="truncate"
                        title={item.correspondingAuthor}
                      >
                        {item.correspondingAuthor}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[80px] text-center">
                      <div className="truncate" title={item.vol}>
                        {item.vol}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[100px] text-center">
                      <div className="truncate" title={item.page}>
                        {item.page}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[80px] text-center">
                      {item.paperLink && (
                        <a
                          href={item.paperLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          title={item.paperLink}
                        >
                          링크
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate" title={item.doi}>
                        {item.doi}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[100px]">
                      <div className="truncate" title={item.pmid}>
                        {item.pmid}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[100px] text-center">
                      {item.attachments && item.attachments.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1"
                            >
                              <Download className="h-4 w-4" />
                              <span>{item.attachments.length}개</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.attachments.map((file, idx) => (
                              <DropdownMenuItem
                                // eslint-disable-next-line react/no-array-index-key
                                key={idx}
                                onClick={() => {
                                  console.log('[v0] Downloading file:', file);
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {file}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[80px] text-center">
                      {item.citationCount}
                    </TableCell>
                    {!isUserView && (
                      <TableCell className="max-w-[120px] text-center">
                        <span>{item.professorRole}</span>
                      </TableCell>
                    )}
                    {!isUserView && (
                      <TableCell className="max-w-[100px] text-center">
                        {item.isRepresentative && <span>대표</span>}
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
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
                            onClick={() => onDelete(item.id, 'paper')}
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
    </TooltipProvider>
  );
}
