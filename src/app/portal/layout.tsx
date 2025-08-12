'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { usePathname } from 'next/navigation';
import { FloatingSidebarTrigger } from '@/components/common/floating-sidebar-trigger';

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDailyReport = pathname === '/portal/reports/daily';
  const noPadding = pathname === '/portal/users/leaves';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        className={`flex flex-1 flex-col overflow-hidden ${isDailyReport ? 'bg-muted' : ''}`}
      >
        <FloatingSidebarTrigger />
        <div
          className={`flex-1 overflow-y-auto ${noPadding ? '' : 'px-16 py-10'}`}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
