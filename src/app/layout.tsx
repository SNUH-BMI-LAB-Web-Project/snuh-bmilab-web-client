import type { Metadata } from 'next';
import './globals.css';
import AppHeader from '@/components/app-header';
import { Toaster } from '@/components/ui/sonner';
import QueryProvider from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'BMI-LAB',
  description: '서울대학교병원 BMI-LAB 홈페이지',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <AppHeader />
          <div className="mt-[70px]">{children}</div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
