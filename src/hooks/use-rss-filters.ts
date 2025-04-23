'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RssFilterStore {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
}

export const useRssFilterStore = create<RssFilterStore>()(
  persist(
    (set) => ({
      currentPage: 1,
      setCurrentPage: (page) => set({ currentPage: page }),
      itemsPerPage: 5,
      setItemsPerPage: (count) => set({ itemsPerPage: count }),
    }),
    {
      name: 'rss-filter-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
