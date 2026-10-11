import RolesView from '@/features/roles/view/RolesView';
import { appConfig } from '@/config/appConfig';

export const metadata = {
  title: `Roles | ${appConfig.name}`,
  robots: 'noindex, nofollow',
};

export default function Page() {
  return <RolesView />;
}
