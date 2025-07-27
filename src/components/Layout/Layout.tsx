'use client';

import Footer from './Footer';
import GitHubCorner from '../UI/GitHubCorner';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div
      className='min-h-screen flex flex-col theme-bg relative'
      data-testid='layout-wrapper'
    >
      <main className='flex-1'>{children}</main>
      <Footer />
      <GitHubCorner />
    </div>
  );
}

export default Layout;
