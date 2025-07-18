'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { appConfig } from '@/config/app';
import { PrimaryButton, SecondaryButton } from '@/components/UI/Button';
import ErrorPage from './ErrorPage';

interface ServerErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ServerErrorPage({
  reset,
}: Omit<ServerErrorPageProps, 'error'>) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    // Check if there's browser history to go back to
    setHasHistory(window.history.length > 1);
  }, []);

  const customActions = (
    <>
      <PrimaryButton onClick={reset} icon='fa-redo' className='w-full'>
        Try Again
      </PrimaryButton>

      {hasHistory && (
        <SecondaryButton
          onClick={() => router.push('/')}
          icon='fa-home'
          className='w-full'
        >
          Return to {appConfig.name}
        </SecondaryButton>
      )}
    </>
  );

  return (
    <ErrorPage
      code={500}
      title='Server Error'
      message={appConfig.errorMessages.serverError}
      icon='fa-exclamation-triangle'
      showGoBack={false}
      customActions={customActions}
    />
  );
}
