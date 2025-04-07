import Header from '@/app/(header)/_components/header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
