'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { usePathname } from 'next/navigation';

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isDailyReport = pathname === '/portal/reports/daily';

  return (
    <SidebarProvider>
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
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
