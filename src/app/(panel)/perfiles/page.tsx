import ProfilesView from '@/features/profiles/view/ProfilesView';
import { appConfig } from '@/config/appConfig';

export const metadata = {
  title: `Perfiles | ${appConfig.name}`,
  robots: 'noindex, nofollow',
};

export default function Page() {
  return <ProfilesView />;
}
