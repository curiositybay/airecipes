'use client';

import ErrorPage from '@/components/UI/ErrorPage';
import { appConfig } from '@/config/app';

export default function NotFound() {
  return (
    <ErrorPage
      code={404}
      title='Page Not Found'
      message={appConfig.errorMessages.notFound}
      icon='fa-search'
    />
  );
}
