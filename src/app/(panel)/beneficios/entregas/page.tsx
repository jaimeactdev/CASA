import DeliveriesView from '@/features/deliveries/view/DeliveriesView';
import { appConfig } from '@/config/appConfig';

export const metadata = {
  title: `Entregas | ${appConfig.name}`,
  robots: 'noindex, nofollow',
};

export default function Page() {
  return <DeliveriesView />;
}
