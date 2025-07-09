'use client';

import { usePathname } from 'next/navigation';

export function useShouldShowSidebar() {
  const pathname = usePathname();

  const hidePaths = [
    '/portal/researches/projects/',
    '/portal/users/',
    '/portal/mypage',
    '/system/researches/projects/',
    '/system/users/',
  ];

  return !hidePaths.some((prefix) => pathname.startsWith(prefix));
}
