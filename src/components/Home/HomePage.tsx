import React from 'react';
import Link from 'next/link';
import ContactForm from '@/components/Examples/ContactForm';
import { getTheme } from '@/config/theme';

const HomePage = () => {
  const theme = getTheme('ocean');
  return (
    <div className={`min-h-screen ${theme.colors.backgroundGradient}`}>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center'>
          <h1
            className={`text-5xl font-bold mb-6 ${theme.colors.text.primary}`}
          >
            Welcome to Your Next.js App
          </h1>
          <p
            className={`text-xl mb-8 max-w-2xl mx-auto ${theme.colors.text.muted}`}
          >
            A modern web application template with Next.js, TypeScript, and
            Tailwind CSS
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
            <Link
              href='/examples'
              className={`text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ${theme.colors.primary} ${theme.colors.primaryHover}`}
            >
              View Examples
            </Link>
            <a
              href='https://github.com/yourusername/your-app'
              target='_blank'
              rel='noopener noreferrer'
              className='bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg transition duration-200'
            >
              View Source
            </a>
          </div>
        </div>

        <div className='grid md:grid-cols-3 gap-8 mt-16'>
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className={`text-3xl mb-4 ${theme.colors.text.iconPrimary}`}>
              <i className='fas fa-code'></i>
            </div>
            <h3
              className={`text-xl font-semibold mb-2 ${theme.colors.text.primary}`}
            >
              Modern Stack
            </h3>
            <p className={theme.colors.text.muted}>
              Built with Next.js, TypeScript, and Tailwind CSS for a robust
              development experience.
            </p>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className={`text-3xl mb-4 ${theme.colors.text.iconSecondary}`}>
              <i className='fas fa-palette'></i>
            </div>
            <h3
              className={`text-xl font-semibold mb-2 ${theme.colors.text.primary}`}
            >
              Beautiful UI
            </h3>
            <p className={theme.colors.text.muted}>
              Styled with Tailwind CSS for a modern, responsive design that
              looks great on all devices.
            </p>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className={`text-3xl mb-4 ${theme.colors.text.iconPrimary}`}>
              <i className='fas fa-rocket'></i>
            </div>
            <h3
              className={`text-xl font-semibold mb-2 ${theme.colors.text.primary}`}
            >
              Ready to Deploy
            </h3>
            <p className={theme.colors.text.muted}>
              Includes testing, linting, and build configurations for
              production-ready applications.
            </p>
          </div>
        </div>

        {/* ContactForm for manual testing */}
        <div className='mt-16'>
          <h2
            className={`text-2xl font-bold mb-4 text-center ${theme.colors.text.primary}`}
          >
            Contact Form (Manual Test)
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
