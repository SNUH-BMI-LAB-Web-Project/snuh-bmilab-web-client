'use client';

import React from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { AwardForm } from '@/components/portal/researches/achievement/form/award-form';
import { ConferenceForm } from '@/components/portal/researches/achievement/form/conference-form';
import { PatentForm } from '@/components/portal/researches/achievement/form/patent-form';
import { PaperForm } from '@/components/portal/researches/achievement/form/paper-form';
import { BookForm } from '@/components/portal/researches/achievement/form/book-form';
import { JournalForm } from '@/components/portal/researches/achievement/form/journal-form';

type ResearchType =
  | 'book'
  | 'conference'
  | 'award'
  | 'paper'
  | 'patent'
  | 'journal';

interface ResearchAchievementModalProps {
  open: boolean;
  type: ResearchType;
  editingItem: Record<string, unknown> | null;
  onClose: () => void;
  onSave: (savedItem: Record<string, unknown>, type: ResearchType) => void;
}



const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  const raw = localStorage.getItem('auth-storage');
  const token = raw ? JSON.parse(raw)?.state?.accessToken : null;
  return token;
};

const CREATE_ENDPOINT_MAP: Record<ResearchType, string> = {
  book: '/research/authors',
  conference: '/research/academic-presentations',
  award: '/research/awards',
  paper: '/research/papers',
  patent: '/research/patents',
  journal: '/research/journals',
};

const UPDATE_ENDPOINT_MAP: Record<ResearchType, string> = {
  book: '/research/authors',
  conference: '/research/academic-presentations',
  award: '/research/awards',
  paper: '/research/papers',
  patent: '/research/patents',
  journal: '/research/journals',
};

export function ResearchAchievementModal({
  open,
  type,
  editingItem,
  onClose,
  onSave,
}: ResearchAchievementModalProps) {
  const handleSubmit = async (data: Record<string, unknown>) => {
    const token = getToken();
    if (!token) return;

    let url = '';
    let method: 'POST' | 'PUT' = 'POST';

    if (editingItem) {
      method = 'PUT';
      url = `${API_BASE}${UPDATE_ENDPOINT_MAP[type]}/${editingItem.id}`;
    } else {
      method = 'POST';
      url = `${API_BASE}${CREATE_ENDPOINT_MAP[type]}`;
    }

    let response: Response;

    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    let responseBody: Record<string, unknown> | null = null;
    try {
      responseBody = await response.json();
    } catch {
      // JSON parse failed
    }

    if (!response.ok) {
      if (response.status === 403) {
        toast.error('수정 권한이 없습니다.');
        return;
      }
      throw responseBody;
    }

    toast.success(editingItem ? '수정되었습니다.' : '등록되었습니다.');
    onSave(responseBody ?? {}, type);
    onClose();
  };

  const commonProps = {
    initialData: editingItem ?? undefined,
    onCancel: onClose,
    onSave: handleSubmit,
  };

  const renderForm = () => {
    switch (type) {
      case 'book':
        return <BookForm {...(commonProps as Parameters<typeof BookForm>[0])} />;
      case 'conference':
        return (
          <ConferenceForm
            {...(commonProps as Parameters<typeof ConferenceForm>[0])}
          />
        );
      case 'award':
        return <AwardForm {...(commonProps as Parameters<typeof AwardForm>[0])} />;
      case 'paper':
        return (
          <PaperForm {...(commonProps as Parameters<typeof PaperForm>[0])} />
        );
      case 'patent':
        return (
          <PatentForm {...(commonProps as Parameters<typeof PatentForm>[0])} />
        );
      case 'journal':
        return (
          <JournalForm
            {...(commonProps as Parameters<typeof JournalForm>[0])}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? '연구성과 수정' : '새 연구 성과 등록'}
          </DialogTitle>
          <DialogDescription>
            {editingItem
              ? '연구성과 정보를 수정하세요.'
              : '새로운 연구 성과 정보를 입력하세요.'}
          </DialogDescription>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
