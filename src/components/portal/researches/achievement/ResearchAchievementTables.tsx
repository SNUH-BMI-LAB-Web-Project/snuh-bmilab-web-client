'use client';

import React, { useEffect, useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';

import { BookTable } from '@/components/portal/researches/achievement/table/book-table';
import { ConferenceTable } from '@/components/portal/researches/achievement/table/conference-table';
import { AwardTable } from '@/components/portal/researches/achievement/table/award-table';
import { PaperTable } from '@/components/portal/researches/achievement/table/paper-table';
import { PatentTable } from '@/components/portal/researches/achievement/table/patent-table';
import { JournalTable } from '@/components/portal/researches/achievement/table/journal-table';

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
  onDelete: (id: string, type: ResearchType) => void;
  refreshKey?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

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
  const [journals, setJournals] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const urls = {
          book: `${API_BASE}/research/authors`,
          conference: `${API_BASE}/research/academic-presentations`,
          award: `${API_BASE}/research/awards`,
          paper: `${API_BASE}/research/papers`,
          patent: `${API_BASE}/research/patents`,
          journal: `${API_BASE}/research/journals`,
        };

        const [bookRes, confRes, awardRes, paperRes, patentRes, journalRes] =
          await Promise.all([
            fetch(urls.book, { headers }),
            fetch(urls.conference, { headers }),
            fetch(urls.award, { headers }),
            fetch(urls.paper, { headers }),
            fetch(urls.patent, { headers }),
            fetch(urls.journal, { headers }),
          ]);

        const [
          bookJson,
          confJson,
          awardJson,
          paperJson,
          patentJson,
          journalJson,
        ] = await Promise.all([
          bookRes.json(),
          confRes.json(),
          awardRes.json(),
          paperRes.json(),
          patentRes.json(),
          journalRes.json(),
        ]);

        setBooks(Array.isArray(bookJson.authors) ? bookJson.authors : []);
        setConferences(
          Array.isArray(confJson.presentations) ? confJson.presentations : [],
        );
        setAwards(Array.isArray(awardJson.awards) ? awardJson.awards : []);
        setPapers(Array.isArray(paperJson.papers) ? paperJson.papers : []);
        setPatents(Array.isArray(patentJson.patents) ? patentJson.patents : []);
        setJournals(
          Array.isArray(journalJson.journals) ? journalJson.journals : [],
        );
      } catch (e) {
        console.error('[ResearchAchievementTables] 조회 실패', e);
      }
    };

    fetchAll();
  }, [refreshKey]);

  return (
    <>
      <TabsContent value="book">
        <BookTable data={books} onEdit={(item) => onEdit(item, 'book')} />
      </TabsContent>

      <TabsContent value="conference">
        <ConferenceTable
          data={conferences}
          onEdit={(item) => onEdit(item, 'conference')}
          onDelete={(id) => onDelete(String(id), 'conference')}
        />
      </TabsContent>

      <TabsContent value="award">
        <AwardTable
          data={awards}
          onEdit={(item) => onEdit(item, 'award')}
          onDelete={(id) => onDelete(String(id), 'conference')}
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
          onDelete={(id) => onDelete(String(id), 'patent')}
        />
      </TabsContent>

      <TabsContent value="journal">
        <JournalTable
          data={journals}
          onEdit={(item) => onEdit(item, 'journal')}
        />
      </TabsContent>
    </>
  );
}
