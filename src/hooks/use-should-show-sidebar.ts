'use client';

import { usePathname } from 'next/navigation';

export function useShouldShowSidebar() {
  const pathname = usePathname();

  const hidePaths = [
    '/portal/researches/projects/',
    '/portal/mypage',
    '/portal/etc/board/',
    '/system/researches/projects/',
    '/system/etc/board/',
  ];

  return !hidePaths.some((prefix) => pathname.startsWith(prefix));
}
