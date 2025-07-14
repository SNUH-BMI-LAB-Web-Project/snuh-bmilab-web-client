'use client';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import Image from 'next/image';
import { UserSummary } from '@/generated-api/models/UserSummary';
import React from 'react';
import { positionLabelMap } from '@/constants/position-enum';

export default function UserPopover({ user }: { user: UserSummary }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="cursor-pointer hover:text-black">{user.name}</span>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-76 text-sm">
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <Image
            src={
              user.profileImageUrl && user.profileImageUrl.trim() !== ''
                ? user.profileImageUrl
                : '/default-profile-image.svg'
            }
            alt={user?.name || '사용자 프로필'}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <div className="font-medium text-black">{user?.name}</div>
            <div className="mt-1 text-xs">
              {user?.organization} {user?.department}
              {user?.position && (
                <>
                  <br />
                  {positionLabelMap[user.position]}
                </>
              )}
              <br />
              {user?.email}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
