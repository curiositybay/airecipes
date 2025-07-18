'use client';

import React, { useEffect } from 'react';
import { getTheme } from '@/config/theme';
import VersionDisplay from './VersionDisplay';

interface UnderConstructionClientProps {
  appName: string;
}

export default function UnderConstructionClient({
  appName,
}: UnderConstructionClientProps) {
  const theme = getTheme('ocean');

  useEffect(() => {
    // Set document title for WCAG compliance
    document.title = `Under Construction - ${appName}`;
  }, [appName]);

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center ${theme.colors.backgroundGradient} p-4 text-center`}
    >
      <i
        data-testid='helmet-icon'
        className={`fas fa-helmet-safety text-[clamp(4rem,15vw,8rem)] ${theme.colors.text.iconPrimary} mb-8 drop-shadow-lg`}
      ></i>
      <h1
        className={`text-[clamp(1.5rem,8vw,2.5rem)] font-bold mb-4 ${theme.colors.text.primary} leading-tight max-w-[90vw]`}
      >
        {appName} is under construction
      </h1>
      <p
        className={`text-[clamp(1rem,4vw,1.25rem)] ${theme.colors.text.muted} max-w-[90vw] leading-relaxed`}
      >
        We&apos;re working hard to bring you something awesome. Please check
        back soon!
      </p>
      <VersionDisplay />
    </div>
  );
}
