'use client';

import Image from 'next/image';
import { User } from '@/types/user';
import { currentUser } from '@/data/auth';
import { Button } from '@/components/ui/button';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UserInfoCard({ user }: { user: User }) {
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="text-foreground flex flex-col items-center rounded-lg border bg-white p-6 shadow-sm transition">
      {/* 프로필 이미지 */}
      <div className="relative mb-6 h-48 w-full">
        <Image
          src={
            user.profileImageUrl && user.profileImageUrl.trim() !== ''
              ? user.profileImageUrl
              : '/default-profile-image.svg'
          }
          alt={`${user.name} 프로필`}
          fill
          className="rounded-md object-cover"
        />
      </div>

      {/* 이름, 부서, 이메일 */}
      <div className="text-muted-foreground flex w-full flex-col">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-black">{user.name}</h2>

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-5 focus:outline-none focus-visible:outline-none"
                >
                  <EllipsisVertical className="h-4 w-4" />
                  <span className="sr-only">메뉴</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" sideOffset={32}>
                <DropdownMenuItem>
                  <Pencil /> 정보 수정
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="text-destructive" /> 유저 삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="my-1.5 border-t" />
        <p className="text-sm">{user.department}</p>
        <p className="text-sm">{user.email}</p>
      </div>
    </div>
  );
}
