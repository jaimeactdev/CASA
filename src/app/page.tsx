import { SiteView } from '@/features/site/view/SiteView';
import { seoMetadata } from '@/core/seo/seoMetadata';

export const metadata = seoMetadata.site;

export default function Page() {
  return <SiteView />;
}
