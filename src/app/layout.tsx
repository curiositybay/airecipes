import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { appConfig } from '@/config/app';
import StructuredData from '@/components/StructuredData';

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
        <StructuredData />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
