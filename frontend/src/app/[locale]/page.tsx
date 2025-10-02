import { useTranslations } from 'next-intl';
import { Dashboard } from '@/components/Dashboard';
import { MainLayout } from '@/components/layouts/MainLayout';

export default function HomePage() {
  const t = useTranslations();

  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}
