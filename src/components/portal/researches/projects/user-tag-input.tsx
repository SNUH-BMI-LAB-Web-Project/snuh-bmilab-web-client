'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { UserSummary } from '@/generated-api/models/UserSummary';
import { UserApi } from '@/generated-api/apis/UserApi';
import { useAuthStore } from '@/store/auth-store';
import { getApiConfig } from '@/lib/config';

const userApi = new UserApi(getApiConfig());

interface UserTagInputProps {
  selectedUsers: UserSummary[];
  onChange: (users: UserSummary[]) => void;
  placeholder: string;
  excludeUsers?: UserSummary[]; // 추가
}

export function UserTagInput({
  selectedUsers,
  onChange,
  placeholder,
  excludeUsers,
}: UserTagInputProps) {
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [debouncedInput, setDebouncedInput] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(input);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [input]);

  const searchUsersByKeyword = async (raw: string) => {
    const keyword = raw.trim();

    if (!accessToken) return;

    try {
      const result = await userApi.searchUsers({
        keyword: keyword || undefined,
      });
      setSearchResults(result.users || []);
      setHighlightedIndex(-1);
    } catch (err) {
      console.error('사용자 검색 실패:', err);
      setSearchResults([]);
    }
  };

  const addUser = (user: UserSummary) => {
    if (!selectedUsers.some((u) => u.userId === user.userId)) {
      onChange([...selectedUsers, user]);
    }

    setInput('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const removeUser = (userId: number) => {
    onChange(selectedUsers.filter((u) => u.userId !== userId));
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0,
      );
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1,
      );
    }
  };

  useEffect(() => {
    if (debouncedInput.trim() === '') {
      setSearchResults([]);
      return;
    }

    searchUsersByKeyword(debouncedInput);
    setIsDropdownOpen(true);
  }, [debouncedInput]);

  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownItemRefs.current[highlightedIndex]) {
      dropdownItemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openDropdown = () => {
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);

    if (!input.trim() && searchResults.length === 0) {
      searchUsersByKeyword('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 선택된 사용자 뱃지 */}
      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((user) => (
          <Badge
            key={user.userId}
            variant="secondary"
            className="bg-border flex items-center gap-1 rounded-full py-1 pr-1.5 pl-3 text-xs"
          >
            {user.name ?? 'Unknown'}
            <button
              type="button"
              onClick={() => removeUser(user.userId!)}
              className="rounded-full p-0.5 transition hover:cursor-pointer hover:bg-black/5"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">제거</span>
            </button>
          </Badge>
        ))}
      </div>

      {/* 입력창 */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={input}
          onFocus={openDropdown}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-white text-sm"
        />

        {/* 커스텀 드롭다운 */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md"
          >
            {searchResults.length > 0 ? (
              searchResults
                .filter(
                  (user) =>
                    !selectedUsers.some((u) => u.userId === user.userId) &&
                    !excludeUsers?.some((u) => u.userId === user.userId),
                )
                .map((user, index) => {
                  const isSelected = selectedUsers.some(
                    (u) => u.userId === user.userId,
                  );
                  const isHighlighted = index === highlightedIndex;

                  let buttonClass =
                    'flex w-full flex-col items-start px-3 py-1.5 text-left text-sm transition ';

                  if (isHighlighted) {
                    buttonClass += 'bg-muted';
                  } else if (isSelected) {
                    buttonClass += 'bg-muted/50 cursor-not-allowed';
                  } else {
                    buttonClass += 'hover:bg-muted';
                  }

                  return (
                    <button
                      key={user.userId}
                      ref={(el) => {
                        dropdownItemRefs.current[index] = el;
                      }}
                      type="button"
                      disabled={isSelected}
                      onClick={() => {
                        if (!isSelected && user.userId !== undefined) {
                          addUser(user);
                        }
                      }}
                      className={buttonClass}
                    >
                      <div className="flex w-full flex-row items-center justify-between py-2">
                        <div className="flex flex-row items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {user.department} · {user.email}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="text-primary h-4 w-4" />
                        )}
                      </div>
                    </button>
                  );
                })
            ) : (
              <div className="text-muted-foreground px-4 py-3 text-sm">
                일치하는 사용자가 없습니다
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
