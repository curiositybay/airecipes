'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './Button';
import ThemeSwitcher from './ThemeSwitcher';

export default function AuthControls() {
  const { user, loginAsDemoUser, logout } = useAuth();

  return (
    <div className='flex flex-col sm:flex-row items-end justify-end gap-3'>
      {/* Auth Controls */}
      {user ? (
        // Logged in user - show user info and logout button
        <div className='flex items-center space-x-3'>
          <span className='text-sm theme-text-muted'>{user.email}</span>
          <Button
            onClick={async () => {
              try {
                await logout();
              } catch (error) {
                console.error('Logout error:', error);
              }
            }}
            variant='secondary'
            size='md'
          >
            Logout
          </Button>
        </div>
      ) : (
        // Not logged in - show login button
        <Button
          onClick={async () => {
            await loginAsDemoUser();
          }}
          icon='fas fa-user'
          size='md'
        >
          Login as demo user
        </Button>
      )}

      {/* Theme Switcher - Always visible */}
      <ThemeSwitcher />
    </div>
  );
}
