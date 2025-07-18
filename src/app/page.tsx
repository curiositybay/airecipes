import UnderConstructionClient from '@/components/UI/UnderConstructionClient';
import { appConfig } from '@/config/app';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: `Under Construction - ${appConfig.name}`,
  description: appConfig.description,
};

export default function Home() {
  return <UnderConstructionClient appName={appConfig.name} />;
}
