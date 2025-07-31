'use client';

import { Users, Newspaper, FolderSearch, CircleFadingPlus } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useShouldShowSidebar } from '@/hooks/use-should-show-sidebar';

const baseNav = [
  {
    title: '인사 관리',
    url: '/system/users',
    icon: Users,
    items: [
      { title: '구성원', url: '/system/users/members' },
      { title: '외부 인사', url: '/system/users/external' },
      { title: '휴가 관리', url: '/system/users/leaves' },
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
  {
    title: '기타 관리',
    url: '/system/etc',
    icon: CircleFadingPlus,
    items: [{ title: '정보 게시판', url: '/system/etc/board' }],
  },
];

export function SystemSidebar() {
  const { user } = useAuthStore();
  const shouldShowSidebar = useShouldShowSidebar();

  if (!user || !shouldShowSidebar) {
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
      <SidebarContent className="flex-1 overflow-auto pt-4">
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
