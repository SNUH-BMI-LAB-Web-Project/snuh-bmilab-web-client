'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  link: string;
}

const navItems: NavItem[] = [
  {
    name: 'Research',
    link: '/research',
  },
  {
    name: 'News',
    link: '/news',
  },
  {
    name: 'About Us',
    link: '/about-us',
  },
  {
    name: 'Contact Us',
    link: '/contact-us',
  },

  {
    name: 'Portal',
    link: '/portal/researches/projects',
  },
];

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavBtnClick = (item: NavItem) => {
    router.push(item.link);
  };

  return (
    <header className="text-md flex w-screen items-center justify-between border-b py-5 pr-10 pl-4">
      {/* 좌측 로고 */}
      <button
        type="button"
        onClick={() => router.push('/')}
        className="flex cursor-pointer flex-row items-center gap-3 text-lg font-semibold transition-transform duration-150 hover:scale-105"
      >
        <Image
          src="/bmi-lab-tmp-logo.svg"
          alt="BMI Lab Logo"
          width={30}
          height={30}
          className="bg-transparent"
        />
        <Image
          src="/bmi-lab-tmp-text-logo.svg"
          alt="BMI Lab Text Logo"
          width={140}
          height={30}
          className="bg-transparent"
        />
      </button>

      {/* 우측 내비게이션 */}
      <nav className="flex gap-8">
        {navItems.map((navItem) => {
          const isActive =
            navItem.link === '/portal/researches/projects'
              ? pathname.startsWith('/portal')
              : pathname === navItem.link;

          return (
            <button
              key={navItem.name}
              type="button"
              onClick={() => handleNavBtnClick(navItem)}
              className={cn(
                isActive ? 'text-black' : 'text-muted-foreground font-light',
                'cursor-pointer transition-transform duration-150 hover:scale-105',
              )}
            >
              {navItem.name}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
