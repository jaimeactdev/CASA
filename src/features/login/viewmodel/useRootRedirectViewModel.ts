'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useRootRedirectViewModel() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);
}
