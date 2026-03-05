'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { ResearchApi, type JournalSummaryResponse } from '@/generated-api';
import { getApiConfig } from '@/lib/config';

const researchApi = new ResearchApi(getApiConfig());

/** 선택된 저널: id가 있으면 기존 저널, 없으면 엔터로 입력한 텍스트만 사용 */
export type SelectedJournal = { id: number | null; journalName: string };

interface SingleJournalSelectInputProps {
  value: string;
  onValueChange: (v: string) => void;
  onJournalSelected?: (j: SelectedJournal | null) => void;
  placeholder?: string;
  required?: boolean;
}

export function SingleJournalSelectInput({
  value,
  onValueChange,
  onJournalSelected,
  placeholder = '저널 검색 또는 입력 후 엔터로 추가',
  required,
}: SingleJournalSelectInputProps) {
  const [input, setInput] = useState(value);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<JournalSummaryResponse[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const res = await researchApi.getJournals({
          keyword: input.trim() || undefined,
          page: 0,
          size: 20,
        });
        setList(res.journals ?? []);
      } catch {
        setList([]);
      }
    })();
  }, [input, open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        inputRef.current?.contains(target) ||
        popRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectJournal = useCallback(
    (j: JournalSummaryResponse | JournalResponse) => {
      const name = (j as { journalName?: string }).journalName ?? '';
      setInput(name);
      onValueChange(name);
      onJournalSelected?.(j as JournalSummaryResponse);
      setOpen(false);
    },
    [onValueChange, onJournalSelected],
  );

  const createAndSelectJournal = useCallback(async () => {
    const name = input.trim();
    if (!name) return;

    const exact = list.find(
      (j) => (j.journalName ?? '').toLowerCase() === name.toLowerCase(),
    );
    if (exact) {
      selectJournal(exact);
      return;
    }

    setCreating(true);
    try {
      const created = await researchApi.createJournal({
        createJournalRequest: {
          journalName: name,
          category: 'ESCI',
          year: new Date().getFullYear(),
          publisher: '-',
          publishCountry: '-',
          issn: '-',
          jif: '-',
          jcrRank: '-',
        },
      });
      selectJournal(created);
      toast.success(`저널 "${name}"이(가) 추가되었습니다.`);
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: unknown }).message)
          : '저널 추가에 실패했습니다.';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }, [input, list, selectJournal]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (list.length > 0) {
      const exact = list.find(
        (j) =>
          (j.journalName ?? '').toLowerCase() === input.trim().toLowerCase(),
      );
      if (exact) {
        selectJournal(exact);
        return;
      }
    }
    if (input.trim()) {
      createAndSelectJournal();
    }
  };

  const clear = () => {
    setInput('');
    onValueChange('');
    onJournalSelected?.(null);
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={input}
        required={required}
        placeholder={placeholder}
        className="pr-8"
        disabled={creating}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInput(e.target.value);
          onValueChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {value && (
        <button
          type="button"
          onClick={clear}
          className="hover:bg-muted absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div
          ref={popRef}
          className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow"
        >
          {list.length > 0 ? (
            list.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => selectJournal(j)}
                className="hover:bg-muted flex w-full items-center justify-between px-3 py-2 text-left text-sm"
              >
                <span className="truncate">{j.journalName}</span>
                {value === (j.journalName ?? '') && (
                  <Check className="text-primary h-4 w-4 shrink-0" />
                )}
              </button>
            ))
          ) : (
            <div className="text-muted-foreground px-3 py-2 text-sm">
              검색 결과 없음. 입력 후 엔터를 누르면 새 저널로 추가됩니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
