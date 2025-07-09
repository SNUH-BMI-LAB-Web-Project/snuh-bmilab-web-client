'use client';

import { usePathname } from 'next/navigation';
import { Users, Newspaper, FolderSearch } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';

import { useAuthStore } from '@/store/auth-store';

const baseNav = [
  {
    title: '인사 관리',
    url: '/system/users',
    icon: Users,
    items: [
      { title: '구성원', url: '/system/users' },
      // { title: '휴가 신청', url: '/system/users/leaves' },
      // { title: '자리배치도', url: '/system/users/seats' },
    ],
  },
  {
    title: '업무 관리',
    url: '/system/reports',
    icon: Newspaper,
    items: [{ title: '일일 업무 보고', url: '/system/reports/daily' }],
  },
  {
    title: '연구 관리',
    url: '/system/researches',
    icon: FolderSearch,
    items: [
      // { title: 'RSS 공고', url: '/system/researches/rss' },
      { title: '연구 & 프로젝트', url: '/system/researches/projects' },
    ],
  },
];

export function SystemSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (
    pathname.startsWith('/system/researches/projects/') ||
    pathname.startsWith('/system/users/')
  ) {
    return null;
  }

  if (!user) {
    return null;
  }

  const navMain = baseNav.map((group) => ({
    ...group,
    isActive: true,
    items: group.items?.map((subItem) => ({
      ...subItem,
      isActive: true,
    })),
  }));

  return (
    <Sidebar
      collapsible="icon"
      className="fixed top-[70px] left-0 z-20 flex h-[calc(100vh-70px)] w-[16rem] flex-col border-r"
    >
      <SidebarContent className="flex-1 overflow-auto">
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
