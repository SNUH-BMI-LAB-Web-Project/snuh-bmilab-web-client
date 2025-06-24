'use client';

import { usePathname } from 'next/navigation';
import { SystemSidebar } from '@/components/system/system-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isDailyReport = pathname === '/system/reports/daily';

  return (
    <SidebarProvider>
      <div className="flex flex-1 overflow-hidden">
        <SystemSidebar />
        <SidebarInset
          className={`flex flex-1 flex-col overflow-hidden ${
            isDailyReport ? 'bg-muted' : ''
          }`}
        >
          <div className="flex-1 overflow-y-auto px-20 py-10 pb-30">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
