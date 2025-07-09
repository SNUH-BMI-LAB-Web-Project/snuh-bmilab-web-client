'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { usePathname } from 'next/navigation';
import { FloatingSidebarTrigger } from '@/components/common/floating-sidebar-trigger';
import { useShouldShowSidebar } from '@/hooks/use-should-show-sidebar';

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDailyReport = pathname === '/portal/reports/daily';

  const shouldShowSidebar = useShouldShowSidebar();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        className={`flex flex-1 flex-col overflow-hidden ${
          isDailyReport ? 'bg-muted' : ''
        }`}
      >
        {shouldShowSidebar && <FloatingSidebarTrigger />}
        <div className="flex-1 overflow-y-auto px-20 py-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
