import { appConfig } from '@/config/app';

interface StructuredDataProps {
  type?: 'WebApplication' | 'Organization' | 'Person';
  customData?: object;
}

export default function StructuredData({
  type = 'WebApplication',
  customData,
}: StructuredDataProps) {
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: appConfig.name,
    description: appConfig.description,
    url: appConfig.url,
    logo: `${appConfig.url}/logo.svg`,
    sameAs: [appConfig.githubRepo],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: appConfig.contactEmail,
    },
    author: {
      '@type': 'Person',
      name: appConfig.author,
    },
  };

  const structuredData = customData || defaultStructuredData;

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
