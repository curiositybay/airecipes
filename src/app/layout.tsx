import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { appConfig } from '@/config/app';
import StructuredData from '@/components/StructuredData';
import Layout from '@/components/Layout/Layout';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <title>{appConfig.name}</title>
        <meta name='description' content={appConfig.description} />

        {/* Favicons */}
        <link rel='icon' type='image/x-icon' href='/favicons/favicon.ico' />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicons/favicon-16x16.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicons/favicon-32x32.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/favicons/apple-touch-icon.png'
        />
        <link rel='manifest' href='/favicons/site.webmanifest' />

        <StructuredData />
      </head>
      <body className={inter.className}>
        <ThemeProvider initialTheme='desert'>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
