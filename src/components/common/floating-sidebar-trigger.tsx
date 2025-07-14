'use client';

import { useSidebar, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function FloatingSidebarTrigger() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  let leftClass = '';
  if (isMobile) {
    leftClass = 'left-0';
  } else if (isCollapsed) {
    leftClass = 'left-[45px]';
  } else {
    leftClass = 'left-[252px]';
  }

  return (
    <div
      className={cn(
        'fixed top-[110px] z-10 transition-all duration-300',
        leftClass,
      )}
    >
      <SidebarTrigger />
    </div>
  );
}
