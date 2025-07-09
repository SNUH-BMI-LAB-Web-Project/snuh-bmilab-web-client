'use client';

import { usePathname } from 'next/navigation';
import { SystemSidebar } from '@/components/system/system-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { FloatingSidebarTrigger } from '@/components/common/floating-sidebar-trigger';
import { useShouldShowSidebar } from '@/hooks/use-should-show-sidebar';

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDailyReport = pathname === '/system/reports/daily';

  const shouldShowSidebar = useShouldShowSidebar();

  return (
    <SidebarProvider>
      <div className="flex flex-1 overflow-hidden">
        <SystemSidebar />
        <SidebarInset
          className={`flex flex-1 flex-col overflow-hidden ${
            isDailyReport ? 'bg-muted' : ''
          }`}
        >
          {shouldShowSidebar && <FloatingSidebarTrigger />}
          <div className="flex-1 overflow-y-auto px-20 py-10">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
