'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, FileDown } from 'lucide-react';

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

interface ResearchManagementSystemProps {
  isUserView?: boolean;
}

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

const EXCEL_ENDPOINT_MAP: Record<ResearchType, string> = {
  book: '/research/authors/excel',
  conference: '/research/academic-presentations/excel',
  award: '/research/awards/excel',
  paper: '/research/papers/excel',
  patent: '/research/patents/excel',
  journal: '/research/journals/excel',
};

export default function ResearchManagementSystem({
                                                   isUserView = false,
                                                 }: ResearchManagementSystemProps) {
  const [activeTab, setActiveTab] = useState<ResearchType>('book');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);

  const handleAdd = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any, type: ResearchType) => {
    setEditingItem({ ...item, type });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, type: ResearchType) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    const remove =
      (setter: React.Dispatch<React.SetStateAction<any[]>>) =>
        (prev: any[]) =>
          prev.filter((item) => String(item.id) !== id);

    switch (type) {
      case 'book':
        setBooks(remove(setBooks));
        break;
      case 'conference':
        setConferences(remove(setConferences));
        break;
      case 'award':
        setAwards(remove(setAwards));
        break;
      case 'paper':
        setPapers(remove(setPapers));
        break;
      case 'patent':
        setPatents(remove(setPatents));
        break;
      case 'journal':
        setJournals(remove(setJournals));
        break;
    }
  };

  const handleSave = (data: any, type: ResearchType) => {
    const newItem = {
      ...data,
      id: editingItem?.id ?? `${type}-${Date.now()}`,
    };

    const updater =
      (setter: React.Dispatch<React.SetStateAction<any[]>>) =>
        (prev: any[]) =>
          editingItem
            ? prev.map((i) => (i.id === editingItem.id ? newItem : i))
            : [...prev, newItem];

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

  const handleExportToExcel = async () => {
    const token = getToken();
    if (!token) return;

    const endpoint = EXCEL_ENDPOINT_MAP[activeTab];
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    const blob = await res.blob();
    if (!blob.size) return;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${activeTab}.xlsx`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
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

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportToExcel}>
              <FileDown className="h-4 w-4" />
              엑셀 다운로드
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              연구 성과 등록
            </Button>
          </div>
        </div>

        <ResearchAchievementTables
          books={books}
          conferences={conferences}
          awards={awards}
          papers={papers}
          patents={patents}
          journals={journals}
          isUserView={isUserView}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
