'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer role='contentinfo' aria-label='Site footer' className='footer py-6'>
      <div className='footer-container max-w-4xl mx-auto px-4'>
        <div className='footer-content text-center'>
          <p className='footer-tagline mb-2 text-sm md:text-base'>
            AI Recipe Generator by Curiosity Bay – Create delicious meals from
            what you have, powered by AI.
          </p>
          <p className='footer-copyright text-xs md:text-sm'>
            © {currentYear} Curiosity Bay &middot; Powered by{' '}
            <a
              href='https://curiositybay.com'
              target='_blank'
              rel='noopener noreferrer'
              className='underline'
            >
              Curiosity Bay
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
