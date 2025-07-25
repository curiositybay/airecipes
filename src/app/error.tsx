'use client';

import { useEffect } from 'react';
import ServerErrorPage from '@/components/UI/ServerErrorPage';

/**
 * Metadata cannot be exported from client components in Next.js.
 * The error page uses the default metadata from layout.tsx.
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logs the error to an error reporting service.
    console.error(error);
  }, [error]);

  return <ServerErrorPage reset={reset} />;
}
