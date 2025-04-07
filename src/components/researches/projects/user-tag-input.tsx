'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { users } from '@/data/projects';
import { User } from '@/types/project';

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

  // 사용자 검색
  const searchUsers = (query: string) => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase()),
    );
    setSearchResults(filtered);
  };

  // 사용자 추가
  const addUser = (name: string) => {
    if (name && !selectedUsers.includes(name)) {
      onChange([...selectedUsers, name]);
      setInput('');
      setSearchResults([]);
    }
  };

  // 사용자 제거
  const removeUser = (name: string) => {
    onChange(selectedUsers.filter((user) => user !== name));
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedUsers.map((user) => (
          <Badge
            key={user}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {user}
            <button
              type="button"
              onClick={() => removeUser(user)}
              className="hover:bg-muted ml-1 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">제거</span>
            </button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            searchUsers(e.target.value);
          }}
        />
        {searchResults.length > 0 && (
          <div className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md">
            {searchResults.map((user) => (
              <button
                key={user.userId}
                type="button"
                className="hover:bg-muted w-full px-4 py-2 text-left"
                onClick={() => addUser(user.name)}
              >
                {user.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
