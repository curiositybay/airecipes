export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Web App Template',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT || 'development',
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'A modern full-stack web application template',

  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',

  domain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'your-domain.com',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com',
  githubRepo:
    process.env.NEXT_PUBLIC_GITHUB_REPO ||
    'https://github.com/your-repo/web-app-template',

  author: process.env.NEXT_PUBLIC_APP_AUTHOR || 'Your Name',
  keywords:
    process.env.NEXT_PUBLIC_APP_KEYWORDS ||
    'web development, React, Express, TypeScript, full-stack, template',
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@yourusername',
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'your-email@example.com',

  errorMessages: {
    notFound:
      process.env.NEXT_PUBLIC_404_MESSAGE ||
      "The page you're looking for doesn't exist.",
    serverError:
      process.env.NEXT_PUBLIC_500_MESSAGE ||
      'Something went wrong on our end. Please try again later.',
  },
} as const;

export type AppConfig = typeof appConfig;
