'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isLoading } = useAuth();

  // Show loading state while auth context is initializing
  if (isLoading) {
    return (
      <div className='min-h-screen theme-bg-gradient flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen theme-bg-gradient'>
      {/* Main Content */}
      <div className='flex flex-col min-h-screen'>{children}</div>
    </div>
  );
} 