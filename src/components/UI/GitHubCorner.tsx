'use client';
import { useState, useEffect } from 'react';

const GITHUB_REPO =
  process.env.NEXT_PUBLIC_GITHUB_REPO ||
  'https://github.com/curiositybay/airecipes';

export default function GitHubCorner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 right-0 z-50 transition-transform duration-500 ease-out ${
        isAnimated ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className='relative'>
        <div className='absolute top-1 right-1 w-8 h-8 flex items-center justify-center z-10'>
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setIsVisible(false);
            }}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className='theme-bg-card hover:bg-red-600 theme-text-primary rounded-full w-6 h-6 flex items-center justify-center transition-colors shadow-lg cursor-pointer hover:scale-110 group z-20'
            aria-label='Dismiss'
          >
            <i className='fas fa-circle-xmark text-lg transition-colors group-hover:text-red-600'></i>
          </button>
        </div>

        <a
          href={GITHUB_REPO}
          target='_blank'
          rel='noopener noreferrer'
          className={`block transition-opacity group ${isButtonHovered ? 'pointer-events-none' : ''}`}
          aria-label='View source on GitHub'
          style={{ pointerEvents: isButtonHovered ? 'none' : 'auto' }}
        >
          <div className='bg-black border-2 border-white rounded-tl-lg shadow-lg relative p-6'>
            <div className='flex flex-col items-center gap-2'>
              <img
                src='/GitHub_Lockup_Light.svg'
                alt='GitHub'
                width='120'
                height='30'
                className='transition-transform duration-200 group-hover:scale-110'
              />
              <span className='theme-text-button text-sm font-medium transition-transform duration-200 group-hover:scale-110'>
                Check out the repo!
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
