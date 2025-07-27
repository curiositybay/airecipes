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
  icons: {
    icon: [
      { url: '/favicons/favicon.ico' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/favicons/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className={inter.className}>
      <ThemeProvider initialTheme='desert'>
        <Layout>{children}</Layout>
      </ThemeProvider>
      <StructuredData />
    </body>
  );
}
