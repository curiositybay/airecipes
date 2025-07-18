import { Metadata } from 'next';
import { appConfig } from '@/config/app';

export interface MetadataOptions {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
}

export function generateMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title,
    description,
    keywords,
    image = '/og-image.jpg',
    url,
    type = 'website',
  } = options;

  const fullTitle = title ? `${title} - ${appConfig.name}` : appConfig.name;

  const fullDescription = description || appConfig.description;
  const fullKeywords = keywords || appConfig.keywords;
  const fullUrl = url || `${appConfig.url}${url || ''}`;
  const fullImage = image.startsWith('http')
    ? image
    : `${appConfig.url}${image}`;

  // Note: Structured data is handled differently in Next.js.
  // You can add it as a script tag in your layout or page components.

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: fullKeywords,
    authors: [{ name: appConfig.author }],
    creator: appConfig.author,
    publisher: appConfig.author,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      url: fullUrl,
      title: fullTitle,
      description: fullDescription,
      siteName: appConfig.name,
      locale: 'en_US',
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: appConfig.twitterHandle,
    },
    alternates: {
      canonical: fullUrl,
    },
    other: {
      'theme-color': '#0f766e',
      'msapplication-TileColor': '#0f766e',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': appConfig.name,
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  };
}

export function generatePageMetadata(
  pageTitle: string,
  pageDescription?: string,
  additionalOptions?: Omit<MetadataOptions, 'title' | 'description'>
): Metadata {
  return generateMetadata({
    title: pageTitle,
    description: pageDescription,
    ...additionalOptions,
  });
}

export function generateErrorMetadata(
  errorCode: number,
  errorTitle: string,
  errorDescription: string
): Metadata {
  return generateMetadata({
    title: `${errorTitle} (${errorCode})`,
    description: errorDescription,
    type: 'website',
  });
}
