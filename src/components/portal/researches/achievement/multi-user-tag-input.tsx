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
  onUserSelectedIds?: (ids: number[]) => void;
  placeholder?: string;
}

export function UserTagInputString({
  value,
  onChange,
  onUserSelectedIds,
  placeholder,
}: UserTagInputStringProps) {
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const accessToken = useAuthStore((s) => s.accessToken);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  /* =========================
   * 유저 검색
   * ========================= */
  useEffect(() => {
    if (!isDropdownOpen || !accessToken) return;

    const fetch = async () => {
      try {
        const keyword = input.trim();
        const res = await userApi.searchUsers({
          keyword: keyword || undefined,
        });
        setSearchResults(res.users ?? []);
        setHighlightedIndex(-1);
      } catch {
        setSearchResults([]);
      }
    };

    const t = setTimeout(fetch, 300);
    return () => clearTimeout(t);
  }, [input, accessToken, isDropdownOpen]);

  /* =========================
   * 부모로 ID 전달
   * ========================= */
  useEffect(() => {
    onUserSelectedIds?.(selectedUserIds);
  }, [selectedUserIds, onUserSelectedIds]);

  /* =========================
   * 추가 / 제거
   * ========================= */
  const resetInput = () => {
    setInput('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const addUser = (user: UserSummary | null, name: string) => {
    if (!name.trim()) return;

    if (value.includes(name)) {
      resetInput();
      return;
    }

    onChange([...value, name]);

    if (user?.userId != null) {
      setSelectedUserIds((prev) =>
        prev.includes(user.userId!) ? prev : [...prev, user.userId!],
      );
    }

    resetInput();
  };

  const removeName = (index: number) => {
    const removedName = value[index];
    onChange(value.filter((_, i) => i !== index));

    const user = searchResults.find((u) => u.name === removedName);
    if (user?.userId != null) {
      setSelectedUserIds((prev) => prev.filter((id) => id !== user.userId));
    }
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
        addUser(
          searchResults[highlightedIndex],
          searchResults[highlightedIndex].name ?? '',
        );
      } else {
        addUser(null, keyword);
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
            {searchResults.length > 0 ? (
              searchResults.map((user, index) => (
                <button
                  key={user.userId}
                  type="button"
                  onClick={() => addUser(user, user.name ?? '')}
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

      <div className="flex flex-wrap gap-2">
        {value.map((name, index) => (
          <Badge
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
