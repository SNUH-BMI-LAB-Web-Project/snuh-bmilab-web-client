'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { users } from '@/data/users';
import { User } from '@/types/user';

interface UserTagInputProps {
  selectedUsers: string[];
  onChange: (users: string[]) => void;
  placeholder: string;
}

export function UserTagInput({
  selectedUsers,
  onChange,
  placeholder,
}: UserTagInputProps) {
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 입력 값에 따라 searchResults 업데이트
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInput(value);
    setIsDropdownOpen(true);

    const trimmed = value.trim();

    if (trimmed === '@') {
      setSearchResults(users); // @만 입력했을 땐 전체 보여줘
      setHighlightedIndex(-1);
      return;
    }

    const query = trimmed.replace(/^@/, ''); // @ 제거!

    if (query === '') {
      setSearchResults(users); // @만 입력하고 다시 지웠을 때도 전체 보여주기
      setHighlightedIndex(-1);
      return;
    }

    const filtered = users.filter((user) =>
      (user.name + user.department + user.email)
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    setSearchResults(filtered);
    setHighlightedIndex(-1);
  };

  const addUser = (name: string) => {
    if (name && !selectedUsers.includes(name)) {
      onChange([...selectedUsers, name]);
    }
    setInput('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const removeUser = (name: string) => {
    onChange(selectedUsers.filter((user) => user !== name));
  };

  // 키보드 업/다운/엔터 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

    if (e.key === 'Enter') {
      e.preventDefault();
      const selectedUser = searchResults[highlightedIndex];
      if (selectedUser && !selectedUsers.includes(selectedUser.name)) {
        addUser(selectedUser.name);
      }
    }
  };

  // 드롭다운 하이라이트 이동 시 스크롤 따라가기
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownItemRefs.current[highlightedIndex]) {
      dropdownItemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  // 외부 클릭하면 드롭다운 닫기
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
    setSearchResults(users);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 선택된 사용자 뱃지 */}
      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((user) => (
          <Badge
            key={user}
            variant="secondary"
            className="bg-border flex items-center gap-1 rounded-full px-3 py-1 text-sm"
          >
            {user}
            <button
              type="button"
              onClick={() => removeUser(user)}
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
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="bg-white text-sm"
        />

        {/* 드롭다운 */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md"
          >
            {searchResults.length > 0 ? (
              searchResults.map((user, index) => {
                const isSelected = selectedUsers.includes(user.name);
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
                      if (!isSelected) addUser(user.name);
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
                      {isSelected && <Check className="text-primary h-4 w-4" />}
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
