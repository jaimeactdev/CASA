'use client';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { breadcrumbsByRoute } from '@/shared/router/breadcrumbs';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export const useBreadcrumbs = () => {
  const pathname = usePathname();

  return useMemo(() => {
    let path = pathname;
    const items: BreadcrumbItem[] = [];
    
    while (path) {
      const entry = breadcrumbsByRoute[path];
      if (!entry) break;

      items.unshift({
        label: entry.label,
        href: path !== pathname ? path : undefined, // no href si es actual
      });

      path = entry.parent ?? '';
    }

    return items;
  }, [pathname]);
};
