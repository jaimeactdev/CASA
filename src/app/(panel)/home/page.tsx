import HomePage from '@/features/home/view/HomePage';

import { seoMetadata } from '@/core/seo/seoMetadata';

export const metadata = seoMetadata.home;

export default function home() {
  return <HomePage />;
}