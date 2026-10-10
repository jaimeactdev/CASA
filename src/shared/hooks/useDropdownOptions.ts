'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

export type DropdownOption<T = string | number> = {
  label: string;
  value: T;
};

type Params<TData = unknown, T extends string | number = string | number> = {
  queryKey?: unknown[];
  fetcher?: () => Promise<TData>;
  mapper?: (data: TData) => DropdownOption<T>[];
  initialOptions?: DropdownOption<T>[];
  enabled?: boolean;
  staleTime?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
  onStart?: () => void;
  onComplete?: () => void;
};

export function useDropdownOptions<TData = unknown, T extends string | number = string | number>(
  params: Params<TData, T>
) {
  const {
    queryKey = ['dropdown', 'static'],
    fetcher,
    mapper,
    initialOptions = [],
    enabled = !!fetcher,
    staleTime,
    onSuccess,
    onError,
    onStart,
    onComplete,
  } = params;

  const { data, isLoading, error, refetch, isSuccess, isFetching } = useQuery({
    queryKey,
    queryFn: async () => (fetcher ? await fetcher() : null),
    enabled,
    staleTime,
  });

  const wasFetchingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (isFetching && !wasFetchingRef.current) {
      wasFetchingRef.current = true;
      onStart?.();
    } else if (!isFetching && wasFetchingRef.current) {
      wasFetchingRef.current = false;
      onComplete?.();
    }
  }, [isFetching, enabled, onStart, onComplete]);

  useEffect(() => {
    if (isSuccess && onSuccess) onSuccess(data as TData);
  }, [isSuccess, data, onSuccess]);

  useEffect(() => {
    if (error && onError) onError(error);
  }, [error, onError]);

  const options: DropdownOption<T>[] = fetcher
    ? mapper
      ? mapper(data as TData)
      : ((data as unknown as DropdownOption<T>[]) ?? [])
    : initialOptions;

  return { options, isLoading, error, refetch };
}
