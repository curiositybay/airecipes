'use client';

import React from 'react';
import Link from 'next/link';
import ContactForm from '@/components/Examples/ContactForm';

const HomePage = () => {
  return (
    <div className='min-h-screen'>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center'>
          <h1 className='text-5xl font-bold mb-6 theme-text-primary'>
            Welcome to Your Next.js App
          </h1>
          <p className='text-xl mb-8 max-w-2xl mx-auto theme-text-muted'>
            A modern web application template with Next.js, TypeScript, and
            Tailwind CSS
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
            <Link
              href='/examples'
              className='theme-text-button font-semibold py-3 px-6 rounded-lg transition duration-200 theme-btn-primary'
            >
              View Examples
            </Link>
            <a
              href='https://github.com/yourusername/your-app'
              target='_blank'
              rel='noopener noreferrer'
              className='theme-btn-primary font-semibold py-3 px-6 rounded-lg transition duration-200'
            >
              View Source
            </a>
          </div>

          <div className='max-w-4xl mx-auto'>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
