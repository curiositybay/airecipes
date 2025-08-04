export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME,
  version: process.env.NEXT_PUBLIC_APP_VERSION,
  environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT,
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION,

  apiUrl: process.env.NEXT_PUBLIC_API_URL,

  // Auth Service Configuration - only available on server side.
  authServiceUrl:
    typeof window === 'undefined' ? process.env.AUTH_SERVICE_URL : undefined,

  // App identifier for external services.
  appSlug: process.env.NEXT_PUBLIC_APP_SLUG,

  // Redis Configuration - only available on server side.
  redis: {
    url: typeof window === 'undefined' ? process.env.REDIS_URL : undefined,
    password:
      typeof window === 'undefined' ? process.env.REDIS_PASSWORD : undefined,
  },

  // Middleware Configuration.
  middleware: {
    apiCallTrackHeader: 'x-api-call-track',
  },

  domain: process.env.NEXT_PUBLIC_APP_DOMAIN,
  url: process.env.NEXT_PUBLIC_APP_URL,
  githubRepo:
    process.env.NEXT_PUBLIC_GITHUB_REPO,

  author: process.env.NEXT_PUBLIC_APP_AUTHOR,
  keywords:
    process.env.NEXT_PUBLIC_APP_KEYWORDS,
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL,

  errorMessages: {
    notFound:
      process.env.NEXT_PUBLIC_404_MESSAGE,
    serverError:
      process.env.NEXT_PUBLIC_500_MESSAGE,
  },

  // Node environment - only available on server side.
  nodeEnv: typeof window === 'undefined' ? process.env.NODE_ENV : undefined,

  // OpenAI Configuration - only available on server side.
  openai: {
    apiKey:
      typeof window === 'undefined' ? process.env.OPENAI_API_KEY : undefined,
    model:
      typeof window === 'undefined'
        ? process.env.OPENAI_MODEL || 'gpt-4o-mini'
        : undefined,
  },
} as const;

export type AppConfig = typeof appConfig;
