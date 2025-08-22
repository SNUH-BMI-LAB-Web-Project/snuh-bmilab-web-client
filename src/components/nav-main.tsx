'use client';

import { type LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            pathname === item.url ||
            (item.items &&
              item.items.some((sub) => pathname.startsWith(sub.url)));

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>

              {item.items?.length ? (
                <SidebarMenuSub>
                  {item.items.map((subItem) => {
                    const isSubActive = pathname.startsWith(subItem.url);

                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton isActive={isSubActive} asChild>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
