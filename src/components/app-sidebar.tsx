'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, Bot, Settings2, SquareTerminal } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';

const baseData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: '사용자',
      url: '/',
      icon: SquareTerminal,
      items: [
        { title: '연명부', url: '/members' },
        { title: '휴가', url: '/vacations' },
        { title: '자리배치도', url: '/seating' },
      ],
    },
    {
      title: '업무',
      url: '/tasks',
      icon: Bot,
      items: [
        { title: '집행부 업무 보고', url: '/tasks/report' },
        { title: '일일 업무 보고', url: '/tasks/daily' },
      ],
    },
    {
      title: '연구',
      url: '/researches',
      icon: BookOpen,
      items: [
        { title: 'RSS 공고', url: '/researches/rss' },
        { title: '연구 & 프로젝트', url: '/researches/projects' },
      ],
    },
    {
      title: '물품',
      url: '/items',
      icon: Settings2,
      items: [
        { title: '물자 관리', url: '/items/manage' },
        { title: '보안 컴퓨터 관리', url: '/items/security' },
      ],
    },
    {
      title: '기타',
      url: '/etc',
      icon: Settings2,
      items: [{ title: '정보 게시판', url: '/etc/board' }],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  if (pathname.startsWith('/researches/projects/')) {
    return null;
  }

  const navMain = baseData.navMain.map((group) => {
    const isActiveGroup =
      pathname === group.url ||
      pathname.startsWith(`${group.url}/`) ||
      group.items?.some(
        (subItem) =>
          pathname === subItem.url || pathname.startsWith(`${subItem.url}/`),
      );

    const updatedItems = group.items?.map((subItem) => ({
      ...subItem,
      isActive:
        pathname === subItem.url || pathname.startsWith(`${subItem.url}/`),
    }));

    return {
      ...group,
      isActive: isActiveGroup,
      items: updatedItems,
    };
  });

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <Sidebar {...props}>
        <div className="flex h-full w-full flex-col justify-between overflow-hidden">
          <SidebarContent>
            <NavMain groupLabel="사용자" items={navMain} />
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={baseData.user} />
          </SidebarFooter>
        </div>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}
