'use client';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { User } from '@/types/user';
import Image from 'next/image';

export default function UserPopover({ user }: { user: User }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="cursor-pointer hover:text-black">{user.name}</span>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-72 text-sm">
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
            <div className="text-xs">
              {user?.department} · {user?.email}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
