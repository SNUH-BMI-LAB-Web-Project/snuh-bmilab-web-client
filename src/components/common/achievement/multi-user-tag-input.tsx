'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { UserSummary } from '@/generated-api/models/UserSummary';
import { UserApi } from '@/generated-api/apis/UserApi';
import { useAuthStore } from '@/store/auth-store';
import { getApiConfig } from '@/lib/config';
import { cn } from '@/lib/utils';

const userApi = new UserApi(getApiConfig());

interface UserTagInputStringProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function UserTagInputString({
  value,
  onChange,
  placeholder,
}: UserTagInputStringProps) {
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const accessToken = useAuthStore((s) => s.accessToken);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isComposing, setIsComposing] = useState(false);

  /* =========================
   * 유저 검색
   * ========================= */
  useEffect(() => {
    if (!isDropdownOpen) return;

    const fetch = async () => {
      if (!accessToken) return;

      try {
        const keyword = input.trim();

        const res = await userApi.searchUsers({
          keyword: keyword || undefined, // 비어있으면 전체 조회
        });

        setSearchResults(res.users ?? []);
        setHighlightedIndex(-1);
      } catch {
        setSearchResults([]);
      }
    };

    const t = setTimeout(fetch, 300);
    // eslint-disable-next-line consistent-return
    return () => clearTimeout(t);
  }, [input, accessToken, isDropdownOpen]);

  /* =========================
   * 추가 / 제거
   * ========================= */
  const resetInput = () => {
    setInput('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const addName = (name: string) => {
    if (!name.trim()) return;

    if (value.includes(name)) {
      resetInput();
      return;
    }

    onChange([...value, name]);
    resetInput();
  };

  const removeName = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  /* =========================
   * 키보드 처리
   * ========================= */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1,
      );
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      const keyword = input.trim();
      if (!keyword) return;

      if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
        addName(searchResults[highlightedIndex].name ?? '');
      } else {
        addName(keyword);
      }
    }
  };

  /* =========================
   * 외부 클릭 닫기
   * ========================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* =========================
   * 렌더
   * ========================= */
  return (
    <div className="flex flex-col gap-2">
      {/* 입력 + 드롭다운 */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={input}
          placeholder={placeholder}
          onChange={(e) => {
            setInput(e.target.value);
            setIsDropdownOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsDropdownOpen(true)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={(e) => {
            setIsComposing(false);
            setInput(e.currentTarget.value);
          }}
        />

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow"
          >
            {/* eslint-disable-next-line no-nested-ternary */}
            {searchResults.length > 0 ? (
              searchResults.map((user, index) => (
                <button
                  key={user.userId}
                  type="button"
                  onClick={() => addName(user.name ?? '')}
                  className={cn(
                    'flex w-full flex-col px-3 py-2 text-left text-sm',
                    index === highlightedIndex && 'bg-muted',
                  )}
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {user.department} · {user.email}
                  </span>
                </button>
              ))
            ) : input.trim() ? (
              <div className="text-muted-foreground px-3 py-2 text-sm">
                Enter를 누르면 “{input}” 추가
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* 선택된 이름들 */}
      <div className="flex flex-wrap gap-2">
        {value.map((name, index) => (
          <Badge
            /* eslint-disable-next-line react/no-array-index-key */
            key={`${name}-${index}`}
            variant="secondary"
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
          >
            {name}
            <button
              type="button"
              onClick={() => removeName(index)}
              className="rounded-full p-0.5 hover:bg-black/5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
