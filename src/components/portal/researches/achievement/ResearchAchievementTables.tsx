'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 각 테이블 컴포넌트들 (경로를 프로젝트 구조에 맞게 확인하세요)
import { BookTable } from './table/book-table';
import { ConferenceTable } from './table/conference-table';
import { AwardTable } from './table/award-table';
import { PaperTable } from './table/paper-table';
import { PatentTable } from './table/patent-table';
import { usePaginationState } from '@/lib/use-pagination-state';

type ResearchType =
  | 'book'
  | 'conference'
  | 'award'
  | 'paper'
  | 'patent'
  | 'journal';

interface Props {
  isUserView?: boolean;
  onEdit: (item: Record<string, unknown>, type: ResearchType) => void;
  onDelete: (id: string | number, type: ResearchType) => void;
  refreshKey?: number;
  /** 수정 가능 여부 (어드민 또는 작성자). 미전달 시 전부 표시 */
  canEditRow?: (item: { createdBy?: number | null } | null) => boolean;
  /** 삭제 가능 여부. 미전달 시 전부 표시 */
  canDeleteRow?: (item: { createdBy?: number | null } | null) => boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function PaginationControls({
  currentPage,
  totalPage,
  itemsPerPage,
  onChangePage,
  onChangeItemsPerPage,
}: {
  currentPage: number;
  totalPage: number;
  itemsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeItemsPerPage: (size: number) => void;
}) {
  const clampedTotal = Math.max(1, totalPage);
  const clampedCurrent = Math.max(1, Math.min(clampedTotal, currentPage));

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChangePage(1)}
        disabled={clampedCurrent === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChangePage(Math.max(1, clampedCurrent - 1))}
        disabled={clampedCurrent === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm">
        {clampedCurrent} / {clampedTotal}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onChangePage(Math.min(clampedTotal, clampedCurrent + 1))}
        disabled={clampedCurrent >= clampedTotal}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChangePage(clampedTotal)}
        disabled={clampedCurrent >= clampedTotal}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>

      <Select
        value={String(itemsPerPage)}
        onValueChange={(value) => onChangeItemsPerPage(Number(value))}
      >
        <SelectTrigger className="w-[90px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-50">
          {[5, 10, 20, 50].map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}개
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ResearchAchievementTables({
  isUserView,
  onEdit,
  onDelete,
  refreshKey,
  canEditRow,
  canDeleteRow,
}: Props) {
  const { currentPage, setCurrentPage, itemsPerPage, setItemsPerPage } =
    usePaginationState();

  const [books, setBooks] = useState<Record<string, unknown>[]>([]);
  const [conferences, setConferences] = useState<Record<string, unknown>[]>([]);
  const [awards, setAwards] = useState<Record<string, unknown>[]>([]);
  const [papers, setPapers] = useState<Record<string, unknown>[]>([]);
  const [patents, setPatents] = useState<Record<string, unknown>[]>([]);

  const [booksTotalPage, setBooksTotalPage] = useState(1);
  const [conferencesTotalPage, setConferencesTotalPage] = useState(1);
  const [awardsTotalPage, setAwardsTotalPage] = useState(1);
  const [papersTotalPage, setPapersTotalPage] = useState(1);
  const [patentsTotalPage, setPatentsTotalPage] = useState(1);

  const papersQueryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(Math.max(0, currentPage - 1))); // API는 0-based
    params.set('size', String(itemsPerPage));
    return params.toString();
  }, [currentPage, itemsPerPage]);

  const commonQueryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(Math.max(0, currentPage - 1))); // API는 0-based
    params.set('size', String(itemsPerPage));
    return params.toString();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const fetchAll = async () => {
      const raw = localStorage.getItem('auth-storage');
      const token = raw ? JSON.parse(raw)?.state?.accessToken : null;
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [b, c, a, p, pt] = await Promise.all([
          fetch(`${API_BASE}/research/authors?${commonQueryString}`, {
            headers,
          }).then((r) => r.json()),
          fetch(
            `${API_BASE}/research/academic-presentations?${commonQueryString}`,
            {
              headers,
            },
          ).then((r) => r.json()),
          fetch(`${API_BASE}/research/awards?${commonQueryString}`, {
            headers,
          }).then((r) => r.json()),
          fetch(`${API_BASE}/research/papers?${papersQueryString}`, {
            headers,
          }).then((r) =>
            r.json(),
          ),
          fetch(`${API_BASE}/research/patents?${commonQueryString}`, {
            headers,
          }).then((r) => r.json()),
        ]);

        const withCreatedBy = (arr: Record<string, unknown>[]) =>
          (arr || []).map((x) => ({
            ...x,
            createdBy:
              (x?.createdBy as number | null) ??
              (x?.created_by as number | null) ??
              null,
          }));
        setBooks(withCreatedBy(b.authors || []));
        setBooksTotalPage(b.totalPage ?? 1);
        setConferences(withCreatedBy(c.presentations || []));
        setConferencesTotalPage(c.totalPage ?? 1);
        setAwards(withCreatedBy(a.awards || []));
        setAwardsTotalPage(a.totalPage ?? 1);
        setPapers(withCreatedBy(p.papers || []));
        setPapersTotalPage(p.totalPage ?? 1);
        setPatents(withCreatedBy(pt.patents || []));
        setPatentsTotalPage(pt.totalPage ?? 1);
      } catch (e) {
        console.error('Fetch error:', e);
      }
    };
    fetchAll();
  }, [refreshKey, papersQueryString, commonQueryString]);

  return (
    <>
      <TabsContent value="book">
        <div className="space-y-4">
          <BookTable
            data={books as unknown as Parameters<typeof BookTable>[0]['data']}
            onEdit={(item) =>
              onEdit(item as unknown as Record<string, unknown>, 'book')
            }
            onDelete={(id) => onDelete(id, 'book')}
            canEditRow={canEditRow}
            canDeleteRow={canDeleteRow}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPage={booksTotalPage}
            itemsPerPage={itemsPerPage}
            onChangePage={setCurrentPage}
            onChangeItemsPerPage={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </TabsContent>
      <TabsContent value="conference">
        <div className="space-y-4">
          <ConferenceTable
            data={
              conferences as unknown as Parameters<typeof ConferenceTable>[0]['data']
            }
            onEdit={(item) =>
              onEdit(item as unknown as Record<string, unknown>, 'conference')
            }
            onDelete={(id) => onDelete(id, 'conference')}
            canEditRow={canEditRow}
            canDeleteRow={canDeleteRow}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPage={conferencesTotalPage}
            itemsPerPage={itemsPerPage}
            onChangePage={setCurrentPage}
            onChangeItemsPerPage={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </TabsContent>
      <TabsContent value="award">
        <div className="space-y-4">
          <AwardTable
            data={awards as unknown as Parameters<typeof AwardTable>[0]['data']}
            onEdit={(item) =>
              onEdit(item as unknown as Record<string, unknown>, 'award')
            }
            onDelete={(id) => onDelete(id, 'award')}
            canEditRow={canEditRow}
            canDeleteRow={canDeleteRow}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPage={awardsTotalPage}
            itemsPerPage={itemsPerPage}
            onChangePage={setCurrentPage}
            onChangeItemsPerPage={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </TabsContent>
      <TabsContent value="paper">
        <div className="space-y-4">
          <PaperTable
            data={papers as unknown as Parameters<typeof PaperTable>[0]['data']}
            onEdit={(item) =>
              onEdit(item as unknown as Record<string, unknown>, 'paper')
            }
            onDelete={(id) => onDelete(id, 'paper')}
            isUserView={isUserView}
            canEditRow={canEditRow}
            canDeleteRow={canDeleteRow}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPage={papersTotalPage}
            itemsPerPage={itemsPerPage}
            onChangePage={setCurrentPage}
            onChangeItemsPerPage={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </TabsContent>
      <TabsContent value="patent">
        <div className="space-y-4">
          <PatentTable
            data={patents as unknown as Parameters<typeof PatentTable>[0]['data']}
            onEdit={(item) =>
              onEdit(item as unknown as Record<string, unknown>, 'patent')
            }
            onDelete={(id) => onDelete(id, 'patent')}
            canEditRow={canEditRow}
            canDeleteRow={canDeleteRow}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPage={patentsTotalPage}
            itemsPerPage={itemsPerPage}
            onChangePage={setCurrentPage}
            onChangeItemsPerPage={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </TabsContent>
    </>
  );
}
