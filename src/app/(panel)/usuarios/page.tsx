import UsersView from '@/features/users/view/UsersView';
import { appConfig } from '@/config/appConfig';

export const metadata = {
  title: `Usuarios | ${appConfig.name}`,
  robots: 'noindex, nofollow',
};

export default function Page() {
  return <UsersView />;
}
