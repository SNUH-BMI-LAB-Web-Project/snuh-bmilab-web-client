'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const STORAGE_KEY_PREFIX = 'pagination';

function getStored(pathname: string): { page: number; size: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}-${pathname}`);
    if (!raw) return null;
    const { page, size } = JSON.parse(raw);
    const p = Math.max(1, Number(page) || 1);
    const s = Math.max(1, Math.min(100, Number(size) || 10));
    return { page: p, size: s };
  } catch {
    return null;
  }
}

function getFromUrl(searchParams: URLSearchParams): { page: number; size: number } {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const size = Math.max(1, Math.min(100, Number(searchParams.get('size')) || 10));
  return { page, size };
}

/**
 * 페이지네이션 state를 sessionStorage + URL과 동기화합니다.
 * 하위 경로에서 뒤로가기 해도 페이지/사이즈가 유지됩니다.
 * 우선순위: sessionStorage > URL 쿼리 > 기본값(1, 10)
 */
export function usePaginationState() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<{ page: number; size: number }>(() => {
    const stored = getStored(pathname);
    if (stored) return stored;
    return getFromUrl(searchParams);
  });

  const currentPage = state.page;
  const itemsPerPage = state.size;

  const setCurrentPage = (page: number | ((prev: number) => number)) => {
    setState((prev) => {
      const next = typeof page === 'function' ? page(prev.page) : page;
      return { ...prev, page: Math.max(1, next) };
    });
  };

  const setItemsPerPage = (size: number | ((prev: number) => number)) => {
    setState((prev) => {
      const next = typeof size === 'function' ? size(prev.size) : size;
      return { ...prev, size: Math.max(1, Math.min(100, next)) };
    });
  };

  // 마운트 시에만 sessionStorage 복원 (뒤로가기 등으로 재진입 시). pathname이 바뀌면 다른 목록 페이지이므로 복원.
  useEffect(() => {
    const stored = getStored(pathname);
    if (stored) {
      setState(stored);
    } else {
      setState(getFromUrl(searchParams));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pathname 변경 시에만 복원
  }, [pathname]);

  // page/size 변경 시 sessionStorage 저장 + URL 반영
  useEffect(() => {
    const key = `${STORAGE_KEY_PREFIX}-${pathname}`;
    sessionStorage.setItem(key, JSON.stringify({ page: state.page, size: state.size }));

    const urlPage = Number(searchParams.get('page')) || 1;
    const urlSize = Number(searchParams.get('size')) || 10;
    if (urlPage === state.page && urlSize === state.size) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(state.page));
    params.set('size', String(state.size));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, state.page, state.size, router, searchParams]);

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  };
}
