'use client';

import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavUserProps {
  user: {
    name: string;
    email: string;
    profileImageUrl: string;
  };
}

export default function NavUser({ user }: NavUserProps) {
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarMenu>
      <SidebarMenuItem
        className={cn(
          'flex items-center justify-between p-1',
          isCollapsed && 'justify-center',
        )}
      >
        <div
          className={cn(
            'flex flex-row items-center gap-2',
            isCollapsed && 'flex-col gap-0',
          )}
        >
          <Avatar
            className={cn(
              'aspect-square h-9 w-9 rounded-full border-1',
              isCollapsed && 'mx-auto',
            )}
          >
            <AvatarImage
              src={user.profileImageUrl || '/default-profile-image.svg'}
              alt={user.name}
              className="object-cover"
            />
          </Avatar>

          {!isCollapsed && (
            <div className="flex max-w-[130px] flex-col text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 hover:cursor-pointer"
            onClick={() => router.push('/portal/mypage')}
          >
            <Settings className="size-4" />
            <span className="sr-only">마이 페이지</span>
          </Button>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
