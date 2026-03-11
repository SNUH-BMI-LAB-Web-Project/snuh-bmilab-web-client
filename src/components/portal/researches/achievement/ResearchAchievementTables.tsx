'use client';

import React, { useEffect, useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';

// 각 테이블 컴포넌트들 (경로를 프로젝트 구조에 맞게 확인하세요)
import { BookTable } from './table/book-table';
import { ConferenceTable } from './table/conference-table';
import { AwardTable } from './table/award-table';
import { PaperTable } from './table/paper-table';
import { PatentTable } from './table/patent-table';

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

export function ResearchAchievementTables({
  isUserView,
  onEdit,
  onDelete,
  refreshKey,
  canEditRow,
  canDeleteRow,
}: Props) {
  const [books, setBooks] = useState<Record<string, unknown>[]>([]);
  const [conferences, setConferences] = useState<Record<string, unknown>[]>([]);
  const [awards, setAwards] = useState<Record<string, unknown>[]>([]);
  const [papers, setPapers] = useState<Record<string, unknown>[]>([]);
  const [patents, setPatents] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const raw = localStorage.getItem('auth-storage');
      const token = raw ? JSON.parse(raw)?.state?.accessToken : null;
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [b, c, a, p, pt] = await Promise.all([
          fetch(`${API_BASE}/research/authors`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${API_BASE}/research/academic-presentations`, {
            headers,
          }).then((r) => r.json()),
          fetch(`${API_BASE}/research/awards`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${API_BASE}/research/papers`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${API_BASE}/research/patents`, { headers }).then((r) =>
            r.json(),
          ),
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
        setConferences(withCreatedBy(c.presentations || []));
        setAwards(withCreatedBy(a.awards || []));
        setPapers(withCreatedBy(p.papers || []));
        setPatents(withCreatedBy(pt.patents || []));
      } catch (e) {
        console.error('Fetch error:', e);
      }
    };
    fetchAll();
  }, [refreshKey]);

  return (
    <>
      <TabsContent value="book">
        <BookTable
          data={books as unknown as Parameters<typeof BookTable>[0]['data']}
          onEdit={(item) =>
            onEdit(item as unknown as Record<string, unknown>, 'book')
          }
          onDelete={(id) => onDelete(id, 'book')}
          canEditRow={canEditRow}
          canDeleteRow={canDeleteRow}
        />
      </TabsContent>
      <TabsContent value="conference">
        <ConferenceTable
          data={
            conferences as unknown as Parameters<
              typeof ConferenceTable
            >[0]['data']
          }
          onEdit={(item) =>
            onEdit(item as unknown as Record<string, unknown>, 'conference')
          }
          onDelete={(id) => onDelete(id, 'conference')}
          canEditRow={canEditRow}
          canDeleteRow={canDeleteRow}
        />
      </TabsContent>
      <TabsContent value="award">
        <AwardTable
          data={awards as unknown as Parameters<typeof AwardTable>[0]['data']}
          onEdit={(item) =>
            onEdit(item as unknown as Record<string, unknown>, 'award')
          }
          onDelete={(id) => onDelete(id, 'award')}
          canEditRow={canEditRow}
          canDeleteRow={canDeleteRow}
        />
      </TabsContent>
      <TabsContent value="paper">
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
      </TabsContent>
      <TabsContent value="patent">
        <PatentTable
          data={patents as unknown as Parameters<typeof PatentTable>[0]['data']}
          onEdit={(item) =>
            onEdit(item as unknown as Record<string, unknown>, 'patent')
          }
          onDelete={(id) => onDelete(id, 'patent')}
          canEditRow={canEditRow}
          canDeleteRow={canDeleteRow}
        />
      </TabsContent>
    </>
  );
}
