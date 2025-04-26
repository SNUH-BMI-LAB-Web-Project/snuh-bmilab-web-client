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

import { currentUser } from '@/data/auth';

const baseNav = [
  {
    title: '사용자',
    url: '/portal/users',
    icon: Users,
    items: [
      { title: '연명부', url: '/portal/users' },
      { title: '휴가', url: '/portal/users/leaves' },
      { title: '자리배치도', url: '/portal/users/seats' },
    ],
  },
  {
    title: '업무',
    url: '/portal/reports',
    icon: Newspaper,
    items: [{ title: '일일 업무 보고', url: '/portal/reports/daily' }],
  },
  {
    title: '연구',
    url: '/portal/researches',
    icon: FolderSearch,
    items: [
      { title: 'RSS 공고', url: '/portal/researches/rss' },
      { title: '연구 & 프로젝트', url: '/portal/researches/projects' },
    ],
  },
  {
    title: '물품',
    url: '/portal/goods',
    icon: Boxes,
    items: [
      { title: '물자 관리', url: '/portal/goods/management' },
      { title: '보안 컴퓨터 관리', url: '/portal/goods/computers' },
    ],
    onlyAdmin: true,
  },
  {
    title: '기타',
    url: '/portal/etc',
    icon: CircleFadingPlus,
    items: [{ title: '정보 게시판', url: '/portal/etc/board' }],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  if (pathname.startsWith('/portal/researches/projects/')) {
    return null;
  }

  const navMain = baseNav
    .filter((group) => {
      if (group.onlyAdmin && currentUser.role !== 'ADMIN') {
        return false;
      }
      return true;
    })
    .map((group) => {
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
        <SidebarFooter className="shrink-0 border-t bg-white px-4 py-4">
          <NavUser
            user={{
              name: currentUser.name,
              email: currentUser.email,
              avatar:
                currentUser.profileImageUrl || '/default-profile-image.svg',
            }}
          />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
