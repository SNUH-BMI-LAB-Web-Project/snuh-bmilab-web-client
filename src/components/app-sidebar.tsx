'use client';

import * as React from 'react';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: '사용자',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: '연명부',
          url: '#',
        },
        {
          title: '휴가',
          url: '#',
        },
        {
          title: '자리배치도',
          url: '#',
        },
      ],
    },
    {
      title: '업무',
      url: '#',
      icon: Bot,
      items: [
        {
          title: '집행부 업무 보고',
          url: '#',
        },
        {
          title: '일일 업무 보고',
          url: '#',
        },
      ],
    },
    {
      title: '연구',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'RSS 공고',
          url: '#',
        },
        {
          title: '연구 & 프로젝트',
          url: '#',
        },
      ],
    },
    {
      title: '물품',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: '물자 관리',
          url: '#',
        },
        {
          title: '보안 컴퓨터 관리',
          url: '#',
        },
      ],
    },
    {
      title: '기타',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: '정보 게시판',
          url: '#',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <NavMain groupLabel={"사용자"} items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
