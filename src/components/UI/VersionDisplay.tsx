'use client';

import React, { useEffect, useState } from 'react';

interface Metadata {
  appVersion: string;
  apiVersion: string;
  lastDeployed: string;
}

export default function VersionDisplay() {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/metadata');
        if (!response.ok) {
          throw new Error('Failed to fetch metadata');
        }
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (error || !metadata) {
    return null; // Don't show anything if there's an error
  }

  return (
    <div className='fixed bottom-4 right-4 text-sm z-50 theme-text-primary'>
      v{metadata.appVersion}
    </div>
  );
}
