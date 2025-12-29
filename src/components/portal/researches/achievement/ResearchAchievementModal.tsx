'use client';

import React from 'react';
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
  editingItem: any | null;
  onClose: () => void;
  onSave: (savedItem: any, type: ResearchType) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
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
  const handleSubmit = async (data: any) => {
    const token = getToken();
    if (!token) return;

    let response: Response;

    if (editingItem) {
      response = await fetch(
        `${API_BASE}${UPDATE_ENDPOINT_MAP[type]}/${editingItem.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );
    } else {
      response = await fetch(
        `${API_BASE}${CREATE_ENDPOINT_MAP[type]}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );
    }

    if (!response.ok) {
      const err = await response.json();
      throw err;
    }

    const savedItem = await response.json();
    onSave(savedItem, type);
    onClose();
  };

  const commonProps = {
    initialData: editingItem,
    onCancel: onClose,
    onSave: handleSubmit,
  };

  const renderForm = () => {
    switch (type) {
      case 'book':
        return <BookForm {...commonProps} />;
      case 'conference':
        return <ConferenceForm {...commonProps} />;
      case 'award':
        return <AwardForm {...commonProps} />;
      case 'paper':
        return <PaperForm {...commonProps} />;
      case 'patent':
        return <PatentForm {...commonProps} />;
      case 'journal':
        return <JournalForm {...commonProps} />;
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
