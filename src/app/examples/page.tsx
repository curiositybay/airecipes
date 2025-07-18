import UnderConstructionClient from '@/components/UI/UnderConstructionClient';
import { appConfig } from '@/config/app';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: `Examples - Under Construction - ${appConfig.name}`,
  description: appConfig.description,
};

export default function Examples() {
  return <UnderConstructionClient appName={appConfig.name} />;
}
