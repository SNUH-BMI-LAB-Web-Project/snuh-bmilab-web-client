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
  onEdit: (item: any, type: ResearchType) => void;
  onDelete: (id: string | number, type: ResearchType) => void;
  refreshKey?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export function ResearchAchievementTables({
  isUserView,
  onEdit,
  onDelete,
  refreshKey,
}: Props) {
  const [books, setBooks] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [patents, setPatents] = useState<any[]>([]);

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

        setBooks(b.authors || []);
        setConferences(c.presentations || []);
        setAwards(a.awards || []);
        setPapers(p.papers || []);
        setPatents(pt.patents || []);
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
          data={books}
          onEdit={(item) => onEdit(item, 'book')}
          onDelete={(id) => onDelete(id, 'book')}
        />
      </TabsContent>
      <TabsContent value="conference">
        <ConferenceTable
          data={conferences}
          onEdit={(item) => onEdit(item, 'conference')}
          onDelete={(id) => onDelete(id, 'conference')}
        />
      </TabsContent>
      <TabsContent value="award">
        <AwardTable
          data={awards}
          onEdit={(item) => onEdit(item, 'award')}
          onDelete={(id) => onDelete(id, 'award')}
        />
      </TabsContent>
      <TabsContent value="paper">
        <PaperTable
          data={papers}
          onEdit={(item) => onEdit(item, 'paper')}
          onDelete={(id) => onDelete(id, 'paper')}
          isUserView={isUserView}
        />
      </TabsContent>
      <TabsContent value="patent">
        <PatentTable
          data={patents}
          onEdit={(item) => onEdit(item, 'patent')}
          onDelete={(id) => onDelete(id, 'patent')}
        />
      </TabsContent>
    </>
  );
}
