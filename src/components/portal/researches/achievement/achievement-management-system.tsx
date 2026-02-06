'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { ResearchAchievementModal } from './ResearchAchievementModal';
import { ResearchAchievementTables } from './ResearchAchievementTables';

type ResearchType =
  | 'book'
  | 'conference'
  | 'award'
  | 'paper'
  | 'patent'
  | 'journal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

export default function ResearchManagementSystem({
  isUserView,
}: {
  isUserView?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<ResearchType>('book');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string | number, type: ResearchType) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    const token = getToken();
    const endpointMap: Record<ResearchType, string> = {
      book: 'authors',
      conference: 'academic-presentations',
      award: 'awards',
      paper: 'papers', // 스크린샷 API 명세 반영
      patent: 'patents',
      journal: 'journals',
    };

    try {
      const res = await fetch(
        `${API_BASE}/research/${endpointMap[type]}/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        alert('삭제되었습니다.');
        setRefreshKey((prev) => prev + 1);
      } else {
        alert('삭제 실패: 권한이 없거나 서버 오류가 발생했습니다.');
      }
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const handleEditDefault = (item: any, type: ResearchType) => {
    setEditingItem({ ...item, type });
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto">
      <h1 className="mb-8 text-3xl font-bold">연구 성과</h1>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ResearchType)}
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="book">저서</TabsTrigger>
            <TabsTrigger value="conference">학회 발표</TabsTrigger>
            <TabsTrigger value="award">수상</TabsTrigger>
            <TabsTrigger value="paper">논문</TabsTrigger>
            <TabsTrigger value="patent">특허</TabsTrigger>
          </TabsList>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            연구 성과 등록
          </Button>
        </div>
        <ResearchAchievementTables
          isUserView={isUserView}
          refreshKey={refreshKey}
          onEdit={(item, type) => handleEditDefault(item, type as ResearchType)}
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
        onSave={() => {
          setRefreshKey((prev) => prev + 1);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
}
