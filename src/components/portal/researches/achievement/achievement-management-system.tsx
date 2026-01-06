'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import type {
  Book,
  Conference,
  Award,
  Paper,
  Patent,
  Journal,
} from '@/lib/types';

import { ResearchAchievementModal } from '@/components/portal/researches/achievement/ResearchAchievementModal';
import { ResearchAchievementTables } from '@/components/portal/researches/achievement/ResearchAchievementTables';

type ResearchType =
  | 'book'
  | 'conference'
  | 'award'
  | 'paper'
  | 'patent'
  | 'journal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

interface ResearchManagementSystemProps {
  isUserView?: boolean;
}

export default function ResearchManagementSystem({ isUserView }: ResearchManagementSystemProps) {
  const [activeTab, setActiveTab] = useState<ResearchType>('book');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);

  /* 신규 등록 */
  const handleAdd = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  /* ===============================
     학회 발표 수정 (단건조회)
     =============================== */
  const handleEditConference = async (id: number) => {
    const token = getToken();
    if (!token) return;

    const res = await fetch(
      `${API_BASE}/research/academic-presentations/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error('CONFERENCE DETAIL FETCH FAILED');
    }

    const detail = await res.json();

    setEditingItem({
      ...detail,
      type: 'conference',
    });

    setIsDialogOpen(true);
  };

  /* ===============================
     수상 수정 (단건조회)
     =============================== */
  const handleEditAward = async (id: number) => {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/research/awards/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('AWARD DETAIL FETCH FAILED');
    }

    const detail = await res.json();

    setEditingItem({
      ...detail,
      type: 'award',
    });

    setIsDialogOpen(true);
  };

  /* 기타 타입: 기존 로직 유지 */
  const handleEditDefault = (item: any, type: ResearchType) => {
    setEditingItem({ ...item, type });
    setIsDialogOpen(true);
  };

  /* 저장 후 목록 반영 */
  const handleSave = (savedItem: any, type: ResearchType) => {
    const updater =
      (setter: React.Dispatch<React.SetStateAction<any[]>>) =>
        (prev: any[]) =>
          editingItem
            ? prev.map((i) => (i.id === savedItem.id ? savedItem : i))
            : [...prev, savedItem];

    switch (type) {
      case 'book':
        setBooks(updater(setBooks));
        break;
      case 'conference':
        setConferences(updater(setConferences));
        break;
      case 'award':
        setAwards(updater(setAwards));
        break;
      case 'paper':
        setPapers(updater(setPapers));
        break;
      case 'patent':
        setPatents(updater(setPatents));
        break;
      case 'journal':
        setJournals(updater(setJournals));
        break;
    }

    setIsDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="container mx-auto">
      <h1 className="mb-8 text-3xl font-bold">연구 성과</h1>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ResearchType)}
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-3xl grid-cols-6">
            <TabsTrigger value="book">저서</TabsTrigger>
            <TabsTrigger value="conference">학회 발표</TabsTrigger>
            <TabsTrigger value="award">수상</TabsTrigger>
            <TabsTrigger value="paper">논문</TabsTrigger>
            <TabsTrigger value="patent">특허</TabsTrigger>
            <TabsTrigger value="journal">저널</TabsTrigger>
          </TabsList>

          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            연구 성과 등록
          </Button>
        </div>

        <ResearchAchievementTables
          isUserView={isUserView}
          onEdit={(item, type) => {
            if (type === 'conference') {
              handleEditConference(item.id);
            } else if (type === 'award') {
              handleEditAward(item.id);
            } else {
              handleEditDefault(item, type);
            }
          }}
          onDelete={(id, type) => {
          }}
        />
      </Tabs>

      <ResearchAchievementModal
        open={isDialogOpen}
        type={editingItem?.type || activeTab}
        editingItem={editingItem}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
