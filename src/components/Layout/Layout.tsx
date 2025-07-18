'use client';

import Footer from './Footer';
import GitHubCorner from '../UI/GitHubCorner';
import ThemeSwitcher from '../UI/ThemeSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div
      className='min-h-screen flex flex-col theme-bg relative'
      data-testid='layout-wrapper'
    >
      {/* Floating Theme Switcher */}
      <div className='absolute top-4 right-4 z-50'>
        <ThemeSwitcher />
      </div>

      <main className='flex-1'>{children}</main>
      <Footer />
      <GitHubCorner />
    </div>
  );
}

export default Layout;
