'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthControls() {
  const { user, loginAsDemoUser, logout } = useAuth();

  return (
    <div className='flex items-center space-x-3'>
      {user ? (
        // Logged in user - show user info and logout button
        <>
          <span className='text-sm theme-text-muted'>{user.email}</span>
          <button
            onClick={async () => {
              try {
                await logout();
              } catch (error) {
                console.error('Logout error:', error);
              }
            }}
            className='px-3 py-1 text-sm theme-btn-secondary rounded transition-colors duration-200 hover:opacity-80'
          >
            Logout
          </button>
        </>
      ) : (
        // Not logged in - show login button
        <button
          onClick={async () => {
            await loginAsDemoUser();
          }}
          className='px-4 py-2 theme-btn-primary rounded-lg font-semibold transition-colors duration-200 hover:opacity-80'
        >
          <i className='fas fa-user mr-2'></i>
          Login
        </button>
      )}
    </div>
  );
}
