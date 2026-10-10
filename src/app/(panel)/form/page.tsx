import { FormView } from '@/features/form/view/FormView';
import { seoMetadata } from '@/core/seo/seoMetadata';

export const metadata = seoMetadata.form;

export default function FormPage() {
  return <FormView />;
}
