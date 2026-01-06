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
  const token = raw ? JSON.parse(raw)?.state?.accessToken : null;

  console.log('[AUTH]');
  console.log('raw auth-storage:', raw);
  console.log('accessToken:', token);

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
  const handleSubmit = async (data: any) => {
    console.log('[SUBMIT]');
    console.log('type:', type);
    console.log('editingItem:', editingItem);
    console.log('payload:', data);

    const token = getToken();
    if (!token) {
      console.error('[AUTH ERROR] accessToken is null');
      return;
    }

    let url = '';
    let method: 'POST' | 'PUT' = 'POST';

    if (editingItem) {
      method = 'PUT';
      url = `${API_BASE}${UPDATE_ENDPOINT_MAP[type]}/${editingItem.id}`;
    } else {
      method = 'POST';
      url = `${API_BASE}${CREATE_ENDPOINT_MAP[type]}`;
    }

    console.log('[API REQUEST]');
    console.log('METHOD:', method);
    console.log('URL:', url);
    console.log('HEADERS:', {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    console.log('BODY:', JSON.stringify(data));

    let response: Response;

    try {
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    } catch (networkError) {
      console.error('[NETWORK ERROR]');
      console.error(networkError);
      throw networkError;
    }

    let responseBody: any = null;
    try {
      responseBody = await response.json();
      console.log('response body:', responseBody);
    } catch (parseError) {
      console.warn('[RESPONSE PARSE WARNING] JSON parse failed');
    }

    if (!response.ok) {
      console.error('[API ERROR]');
      console.error(responseBody);
      throw responseBody;
    }

    onSave(responseBody, type);
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
        console.error('[RENDER ERROR] invalid research type:', type);
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
