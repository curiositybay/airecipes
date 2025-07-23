import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { appConfig } from '@/config/app';
import StructuredData from '@/components/StructuredData';
import Layout from '@/components/Layout/Layout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

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
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider initialTheme='desert'>
            <Layout>{children}</Layout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
