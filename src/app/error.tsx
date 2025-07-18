'use client';

import { useEffect } from 'react';
import ServerErrorPage from '@/components/UI/ServerErrorPage';

// Note: Metadata cannot be exported from client components in Next.js.
// The error page will use the default metadata from layout.tsx.

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service.
    console.error(error);
  }, [error]);

  return <ServerErrorPage reset={reset} />;
}
