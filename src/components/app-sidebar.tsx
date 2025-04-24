'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  Users,
  Newspaper,
  FolderSearch,
  Boxes,
  CircleFadingPlus,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
      url: '/users',
      icon: Users,
      items: [
        // { title: '연명부', url: '/members' },
        { title: '휴가', url: '/users/leaves' },
        { title: '자리배치도', url: '/users/seats' },
      ],
    },
    {
      title: '업무',
      url: '/reports',
      icon: Newspaper,
      items: [
        { title: '일일 업무 보고', url: '/reports/daily' },
        { title: '집행부 업무 보고', url: '/reports/weekly' },
      ],
    },
    {
      title: '연구',
      url: '/researches',
      icon: FolderSearch,
      items: [
        { title: 'RSS 공고', url: '/researches/rss' },
        { title: '연구 & 프로젝트', url: '/researches/projects' },
      ],
    },
    {
      title: '물품',
      url: '/goods',
      icon: Boxes,
      items: [
        { title: '물자 관리', url: '/goods/management' },
        { title: '보안 컴퓨터 관리', url: '/items/computers' },
      ],
    },
    {
      title: '기타',
      url: '/etc',
      icon: CircleFadingPlus,
      items: [{ title: '정보 게시판', url: '/etc/board' }],
    },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();

  if (pathname.startsWith('/researches/projects/')) {
    return null;
  }

  const navMain = baseData.navMain.map((group) => {
    const updatedItems = group.items?.map((subItem) => ({
      ...subItem,
      isActive: true,
    }));

    return {
      ...group,
      isActive: true,
      items: updatedItems,
    };
  });

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      <Sidebar className="flex h-full w-[16rem] flex-col border-r">
        <SidebarContent className="flex-1 overflow-auto">
          <NavMain items={navMain} />
        </SidebarContent>
        <SidebarFooter className="shrink-0 border-t bg-white px-4 py-3">
          <NavUser user={baseData.user} />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
