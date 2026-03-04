'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { ResearchApi, type JournalSummaryResponse } from '@/generated-api';
import { getApiConfig } from '@/lib/config';

const researchApi = new ResearchApi(getApiConfig());

interface SingleJournalSelectInputProps {
  value: string;
  onValueChange: (v: string) => void;
  onJournalSelected?: (j: JournalSummaryResponse | null) => void;
  placeholder?: string;
  required?: boolean;
}

export function SingleJournalSelectInput({
  value,
  onValueChange,
  onJournalSelected,
  placeholder = '저널 검색',
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

  const selectJournal = (j: JournalSummaryResponse) => {
    const name = j.journalName ?? '';
    setInput(name);
    onValueChange(name);
    onJournalSelected?.(j);
    setOpen(false);
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
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInput(e.target.value);
          onValueChange(e.target.value);
          setOpen(true);
        }}
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
              검색 결과 없음
            </div>
          )}
        </div>
      )}
    </div>
  );
}
