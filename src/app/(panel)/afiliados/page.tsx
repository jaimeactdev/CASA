import MembersView from '@/features/members/view/MembersView';
import { appConfig } from '@/config/appConfig';

export const metadata = {
  title: `Afiliados | ${appConfig.name}`,
  robots: 'noindex, nofollow',
};

export default function Page() {
  return <MembersView />;
}
