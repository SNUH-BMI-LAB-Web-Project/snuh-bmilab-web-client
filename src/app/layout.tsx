import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
