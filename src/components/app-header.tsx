'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

interface NavItem {
  name: string;
  link: string;
}

const navItems: NavItem[] = [
  { name: 'Home', link: '/' },
  { name: 'Members', link: '/members' },
  { name: 'Research', link: '/research' },
  { name: 'Lab Seminar', link: '/lab-seminar' },
  { name: 'News', link: '/news' },
  { name: 'Alumni', link: '/alumni' },
];

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, role, logout } = useAuthStore();

  const handlePortalClick = () => {
    if (accessToken) {
      router.push('/portal/researches/projects');
    } else {
      router.push('/login');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
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
      <nav className="flex gap-12">
        {navItems.map((navItem) => {
          const isActive = pathname === navItem.link;
          return (
            <button
              key={navItem.name}
              type="button"
              onClick={() => router.push(navItem.link)}
              className={cn(
                isActive ? 'text-black' : 'text-muted-foreground font-light',
                'cursor-pointer transition-transform duration-150 hover:scale-105',
              )}
            >
              {navItem.name}
            </button>
          );
        })}

        {/* Portal 또는 Log Out 버튼 */}
        {pathname.startsWith('/portal') && accessToken ? (
          <button
            type="button"
            onClick={handleLogout}
            className="w-[60px] cursor-pointer text-black transition-transform duration-150 hover:scale-105"
          >
            Log Out
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePortalClick}
            className={cn(
              pathname.startsWith('/portal') || pathname === '/login'
                ? 'text-black'
                : 'text-muted-foreground font-light',
              'w-[60px] cursor-pointer transition-transform duration-150 hover:scale-105',
            )}
          >
            Portal
          </button>
        )}

        {/* System 버튼 (어드민만 보임) */}
        {role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => router.push('/system/users')}
            className={cn(
              pathname.startsWith('/system')
                ? 'text-black'
                : 'text-muted-foreground font-light',
              'w-[60px] cursor-pointer transition-transform duration-150 hover:scale-105',
            )}
          >
            System
          </button>
        )}
      </nav>
    </header>
  );
}
