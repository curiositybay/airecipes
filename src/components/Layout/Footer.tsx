import { appConfig } from '@/config/app';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='footer'>
      <div className='footer-container'>
        <div className='footer-content'>
          <p className='footer-tagline'>{appConfig.description}</p>
          <p className='footer-copyright'>
            © {currentYear} {appConfig.author}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
