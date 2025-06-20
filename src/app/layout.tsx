import type { Metadata } from 'next';
import './globals.css';
import AppHeader from '@/components/app-header';
import { Toaster } from '@/components/ui/sonner';

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
    <html lang="ko" className="h-full">
      <body className="flex h-full flex-col">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
