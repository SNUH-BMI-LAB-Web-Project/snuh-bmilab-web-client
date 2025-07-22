'use client';

import { usePathname } from 'next/navigation';
import { Users, Newspaper, FolderSearch, CircleFadingPlus } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import NavUser from '@/components/nav-user';

import { useAuthStore } from '@/store/auth-store';

const baseNav = [
  {
    title: '인사',
    url: '/portal/users',
    icon: Users,
    items: [
      { title: '구성원', url: '/portal/users' },
      // { title: '휴가 신청', url: '/portal/users/leaves' },
      // { title: '자리배치도', url: '/portal/users/seats' },
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
    items: [{ title: '연구 & 프로젝트', url: '/portal/researches/projects' }],
  },
  {
    title: '기타',
    url: '/portal/etc',
    icon: CircleFadingPlus,
    items: [
      { title: 'RSS 공고', url: '/portal/etc/rss' },
      // { title: '정보 게시판', url: '/portal/etc/board' },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (
    pathname.startsWith('/portal/researches/projects/') ||
    pathname.startsWith('/portal/mypage')
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
      <SidebarContent className="flex-1 overflow-auto pt-4">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="shrink-0 border-t bg-white px-4 py-4">
        <NavUser
          user={{
            name: user.name || '이름 없음',
            email: user.email || '이메일 없음',
            profileImageUrl:
              user.profileImageUrl ?? '/default-profile-image.svg',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
