'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

interface NavItem {
  name: string;
  link: string;
}

const navItems: NavItem[] = [
  {
    name: 'LAB 소개',
    link: '',
  },
  {
    name: '포털',
    link: '',
  },
];

export default function Header() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(-1);

  const handleNavBtnClick = (item: NavItem, index: number) => {
    router.push(`${item.link}`);
    setCurrentIndex(index);
  };

  return (
    <header className="text-md flex w-screen items-center justify-between border-b py-5 pr-10 pl-4">
      {/* 좌측 로고 */}
      <div className="flex flex-row items-center gap-3 text-lg font-semibold">
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
      </div>
      {/* 우측 내비게이션 */}
      <nav className="flex gap-5">
        {navItems.map((navItem: NavItem, index: number) => (
          <button
            key={navItem.name}
            type="button"
            onClick={() => handleNavBtnClick(navItem, index)}
            className={
              index === currentIndex ? 'font-semibold' : 'hover:font-semibold'
            }
          >
            {navItem.name}
          </button>
        ))}
      </nav>
    </header>
  );
}
