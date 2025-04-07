'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  {
    name: '로그아웃',
    link: '/desktop/login',
  },
];

export default function NavBar() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(-1);

  const handleNavBtnClick = (item: NavItem, index: number) => {
    router.push(`${item.link}`);
    setCurrentIndex(index);
  };

  return (
    <header className="flex w-screen justify-end gap-5 border-b-[1px] border-solid px-[50px] pt-5 pb-5">
      {navItems.map((navItem: NavItem, index: number) => (
        <button
          className={
            index === currentIndex
              ? 'text-body-2-normal_semi font-bold'
              : 'text-body-2-normal_semi hover:font-bold'
          }
          key={navItem.name}
          type="button"
          onClick={() => handleNavBtnClick(navItem, index)}
        >
          {navItem.name}
        </button>
      ))}
    </header>
  );
}
