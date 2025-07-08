'use client';

import { useSidebar, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function FloatingSidebarTrigger() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div
      className={cn(
        'fixed top-[100px] z-10 transition-all duration-300 ease-in-out',
        isCollapsed ? 'left-[30px]' : 'left-[240px]',
      )}
    >
      <SidebarTrigger />
    </div>
  );
}
