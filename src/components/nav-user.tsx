'use client';

import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface NavUserProps {
  user: {
    name: string;
    email: string;
    profileImageUrl: string;
  };
}

export default function NavUser({ user }: NavUserProps) {
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-between p-1">
        <div className="flex flex-row gap-2">
          <Avatar className="aspect-square h-9 w-9 rounded-full">
            <AvatarImage
              src={user.profileImageUrl || '/default-profile-image.svg'}
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
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 hover:cursor-pointer"
          onClick={() => router.push('/portal/mypage')}
        >
          <Settings className="size-4" />
          <span className="sr-only">마이 페이지</span>
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
