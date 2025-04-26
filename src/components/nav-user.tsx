'use client';

import { LogOut, EllipsisVertical, UserCog } from 'lucide-react';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-between p-1">
        <div className="flex flex-row gap-4">
          <Avatar className="aspect-square h-9 w-9 rounded-full">
            <AvatarImage
              src={user.avatar}
              alt={user.name}
              className="object-cover"
            />
          </Avatar>

          <div className="flex flex-col text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted focus:outline-none focus-visible:ring-0"
            >
              <EllipsisVertical className="size-4" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-42 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={30}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCog />
                마이페이지
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
