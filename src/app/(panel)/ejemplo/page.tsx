import { EjemploView } from '@/features/ejemplo/view/EjemploView';
import { seoMetadata } from '@/core/seo/seoMetadata';

export const metadata = seoMetadata.ejemplo;

export default function EjemploPage() {
  return <EjemploView />;
}
