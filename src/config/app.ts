// Validate required environment variables only on server side
if (typeof window === 'undefined' && !process.env.AUTH_SERVICE_URL) {
  throw new Error('AUTH_SERVICE_URL environment variable is required');
}

export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'AI Recipes by Curiosity Bay',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT || 'development',
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'AI-powered recipe generation and meal planning',

  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',

  // Auth Service Configuration - only available on server side
  authServiceUrl: typeof window === 'undefined' ? process.env.AUTH_SERVICE_URL : undefined,

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
