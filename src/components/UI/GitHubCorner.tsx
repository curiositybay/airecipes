'use client';

import { useState } from 'react';

function GitHubCorner() {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className='fixed top-0 right-0 z-50'>
      <a
        href='https://github.com/yourusername/your-app'
        target='_blank'
        rel='noopener noreferrer'
        className='block bg-black text-white p-2 hover:bg-gray-800 transition-colors'
        aria-label='View source on GitHub'
      >
        <i className='fab fa-github text-xl'></i>
      </a>
      <button
        onClick={handleDismiss}
        className='absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors'
        aria-label='Dismiss GitHub corner'
      >
        ×
      </button>
    </div>
  );
}

export default GitHubCorner;
