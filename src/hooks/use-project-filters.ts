'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProjectFilterStore {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  committedSearchTerm: string;
  setCommittedSearchTerm: (term: string) => void;
  fieldFilter: string;
  setFieldFilter: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (term: string) => void;
  leaderFilter: string;
  setLeaderFilter: (term: string) => void;
  sortOption: string;
  setSortOption: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  showFilters: boolean;
  setShowFilters: (visible: boolean) => void;
}

export const useProjectFilterStore = create<ProjectFilterStore>()(
  persist(
    (set) => ({
      searchTerm: '',
      setSearchTerm: (term) => set({ searchTerm: term }),
      committedSearchTerm: '',
      setCommittedSearchTerm: (term) => set({ committedSearchTerm: term }),
      fieldFilter: 'all',
      setFieldFilter: (term) => set({ fieldFilter: term }),
      statusFilter: 'all',
      setStatusFilter: (term) => set({ statusFilter: term }),
      leaderFilter: 'all',
      setLeaderFilter: (term) => set({ leaderFilter: term }),
      sortOption: 'created-desc',
      setSortOption: (term) => set({ sortOption: term }),
      currentPage: 1,
      setCurrentPage: (page) => set({ currentPage: page }),
      itemsPerPage: 5,
      setItemsPerPage: (count) => set({ itemsPerPage: count }),
      showFilters: false,
      setShowFilters: (visible) => set({ showFilters: visible }),
    }),
    {
      name: 'project-filter-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
