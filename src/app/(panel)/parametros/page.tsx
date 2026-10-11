import SettingsView from '@/features/settings/view/SettingsView';
import { appConfig } from '@/config/appConfig';

export const metadata = {
  title: `Parámetros | ${appConfig.name}`,
  robots: 'noindex, nofollow',
};

export default function Page() {
  return <SettingsView />;
}
