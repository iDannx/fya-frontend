import { useCallback, useEffect, useState } from 'react';
import { fetchCredits } from '../api/credits';
import type { CreditFilters, CreditPage, CreditSort } from '../types/credit';

const COMPACT_VIEWPORT = '(max-width: 767px)';
const PAGE_SIZE_COMPACT = 5;
const PAGE_SIZE_WIDE = 10;
const DEBOUNCE_MS = 300;
const EMPTY_FILTERS: CreditFilters = { clientName: '', document: '', agentName: '' };

type LoadStatus = 'loading' | 'ready' | 'error';

function currentPageSize(): number {
  return window.matchMedia(COMPACT_VIEWPORT).matches ? PAGE_SIZE_COMPACT : PAGE_SIZE_WIDE;
}

export function useCredits() {
  const [filters, setFilters] = useState<CreditFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<CreditFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CreditSort | undefined>();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(currentPageSize);
  const [result, setResult] = useState<CreditPage>();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const viewport = window.matchMedia(COMPACT_VIEWPORT);
    const sync = () => {
      setSize(currentPageSize());
      setPage(0);
    };
    viewport.addEventListener('change', sync);
    return () => viewport.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(filters);
      setPage(0);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setResult(
        await fetchCredits({
          clientName: appliedFilters.clientName.trim() || undefined,
          document: appliedFilters.document.trim() || undefined,
          agentName: appliedFilters.agentName.trim() || undefined,
          sort,
          page,
          size,
        }),
      );
      setStatus('ready');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ocurrió un error inesperado');
      setStatus('error');
    }
  }, [appliedFilters, sort, page, size]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeSort = useCallback((next: CreditSort | undefined) => {
    setSort(next);
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  return {
    credits: result?.content ?? [],
    metadata: result?.page,
    filters,
    setFilters,
    clearFilters,
    sort,
    changeSort,
    page,
    setPage,
    status,
    error,
    reload: load,
  };
}
