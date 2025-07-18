'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { appConfig } from '@/config/app';
import { PrimaryButton, SecondaryButton } from '@/components/UI/Button';
import { getTheme } from '@/config/theme';

interface ErrorPageProps {
  code: number;
  title: string;
  message: string;
  icon?: string;
  showGoBack?: boolean;
  customActions?: ReactNode;
}

export default function ErrorPage({
  code,
  title,
  message,
  icon = 'fa-exclamation-triangle',
  showGoBack = true,
  customActions,
}: ErrorPageProps) {
  const [hasHistory, setHasHistory] = useState(false);
  const theme = getTheme('ocean');

  useEffect(() => {
    setHasHistory(window.history.length > 1);
  }, []);

  useEffect(() => {
    document.title = `${title} - ${appConfig.name}`;
  }, [title]);

  return (
    <div className={`min-h-screen ${theme.colors.backgroundGradient} relative`}>
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-400 to-blue-600 opacity-5 rounded-full'></div>
        <div className='absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 opacity-5 rounded-full'></div>
      </div>

      <div className='flex items-center justify-center min-h-screen px-4'>
        <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center relative z-10'>
          <div className='mb-6'>
            <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i
                className={`fas ${icon} text-3xl ${theme.colors.text.iconPrimary}`}
                role='img'
                data-testid='error-icon'
              ></i>
            </div>
          </div>

          <div className='mb-6'>
            <h1
              className={`text-6xl font-bold mb-2 ${theme.colors.text.primary}`}
            >
              {code}
            </h1>
            <h2
              className={`text-2xl font-semibold mb-4 ${theme.colors.text.secondary}`}
            >
              {title}
            </h2>
          </div>

          <div className='mb-8'>
            <p className={`text-lg ${theme.colors.text.muted}`}>{message}</p>
          </div>

          <div className='flex flex-col gap-4'>
            {customActions ? (
              customActions
            ) : (
              <>
                <Link href='/'>
                  <PrimaryButton icon='fa-home' className='w-full'>
                    Return to {appConfig.name}
                  </PrimaryButton>
                </Link>

                {showGoBack && hasHistory && (
                  <SecondaryButton
                    onClick={() => window.history.back()}
                    icon='fa-arrow-left'
                    className='w-full'
                  >
                    Go Back
                  </SecondaryButton>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
