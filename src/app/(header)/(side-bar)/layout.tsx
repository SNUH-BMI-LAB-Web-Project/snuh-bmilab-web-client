import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-20 py-10 pb-30">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
