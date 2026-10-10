import { LoginPage } from '@/features/login/view/Login';

import { seoMetadata } from '@/core/seo/seoMetadata';

export const metadata = seoMetadata.home;

export default function home() {

  
  return <LoginPage />;
}