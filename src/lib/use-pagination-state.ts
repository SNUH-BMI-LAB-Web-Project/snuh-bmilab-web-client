'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

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

function getFromUrl(searchParams: URLSearchParams): {
  page: number;
  size: number;
} {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const size = Math.max(
    1,
    Math.min(100, Number(searchParams.get('size')) || 10),
  );
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

  const setCurrentPage = useCallback((page: number | ((prev: number) => number)) => {
    setState((prev) => {
      const next = typeof page === 'function' ? page(prev.page) : page;
      const normalized = Math.max(1, next);
      if (prev.page === normalized) return prev;
      return { ...prev, page: normalized };
    });
  }, []);

  const setItemsPerPage = useCallback((size: number | ((prev: number) => number)) => {
    setState((prev) => {
      const next = typeof size === 'function' ? size(prev.size) : size;
      const normalized = Math.max(1, Math.min(100, next));
      if (prev.size === normalized) return prev;
      return { ...prev, size: normalized };
    });
  }, []);

  // 마운트 시 sessionStorage 복원. pathname이 바뀌면 다른 목록 페이지이므로 복원.
  useEffect(() => {
    const stored = getStored(pathname);
    if (stored) {
      setState(stored);
    } else {
      setState(getFromUrl(searchParams));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pathname 변경 시에만 복원
  }, [pathname]);

  // Chrome 등에서 bfcache(뒤로가기 캐시)로 복원될 때: in-memory state는 초기값이라 sessionStorage에서 다시 복원
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        const stored = getStored(pathname);
        if (stored) {
          setState(stored);
          const params = new URLSearchParams(window.location.search);
          params.set('page', String(stored.page));
          params.set('size', String(stored.size));
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [pathname, router]);

  // page/size 변경 시 sessionStorage 저장 + URL 반영
  useEffect(() => {
    const key = `${STORAGE_KEY_PREFIX}-${pathname}`;
    sessionStorage.setItem(
      key,
      JSON.stringify({ page: state.page, size: state.size }),
    );

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
