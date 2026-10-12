import FeesView from '@/features/fees/view/FeesView';
import { appConfig } from '@/config/appConfig';

export const metadata = {
  title: `Pagos | ${appConfig.name}`,
  robots: 'noindex, nofollow',
};

export default function Page() {
  return <FeesView />;
}
