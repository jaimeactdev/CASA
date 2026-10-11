import BenefitsView from '@/features/benefits/view/BenefitsView';
import { appConfig } from '@/config/appConfig';

export const metadata = {
  title: `Beneficios | ${appConfig.name}`,
  robots: 'noindex, nofollow',
};

export default function Page() {
  return <BenefitsView />;
}
