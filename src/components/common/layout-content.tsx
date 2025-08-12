'use client';

import { usePathname } from 'next/navigation';

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLeavesPage = pathname === '/portal/users/leaves';

  return (
    <div
      className={`${isLeavesPage ? 'min-w-[1280px]' : 'min-w-[768px]'} mt-[70px]`}
    >
      {children}
    </div>
  );
}
