// Validate required environment variables
function validateRequiredEnvVars() {
  const requiredVars = {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_APP_ENVIRONMENT: process.env.NEXT_PUBLIC_APP_ENVIRONMENT,
    NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_SLUG: process.env.NEXT_PUBLIC_APP_SLUG,
    NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GITHUB_REPO: process.env.NEXT_PUBLIC_GITHUB_REPO,
    NEXT_PUBLIC_APP_AUTHOR: process.env.NEXT_PUBLIC_APP_AUTHOR,
    NEXT_PUBLIC_APP_KEYWORDS: process.env.NEXT_PUBLIC_APP_KEYWORDS,
    NEXT_PUBLIC_TWITTER_HANDLE: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    NEXT_PUBLIC_404_MESSAGE: process.env.NEXT_PUBLIC_404_MESSAGE,
    NEXT_PUBLIC_500_MESSAGE: process.env.NEXT_PUBLIC_500_MESSAGE,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Validate server-side environment variables
function validateServerEnvVars() {
  if (typeof window === 'undefined') {
    const requiredServerVars = {
      AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
      REDIS_URL: process.env.REDIS_URL,
      NODE_ENV: process.env.NODE_ENV,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    };

    const missingServerVars = Object.entries(requiredServerVars)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingServerVars.length > 0) {
      throw new Error(
        `Missing required server environment variables: ${missingServerVars.join(', ')}`
      );
    }
  }
}

// Validate environment variables on module load
validateRequiredEnvVars();
validateServerEnvVars();

export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME!,
  version: process.env.NEXT_PUBLIC_APP_VERSION!,
  environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT!,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION!,

  apiUrl: process.env.NEXT_PUBLIC_API_URL!,

  // Auth Service Configuration - only available on server side.
  authServiceUrl:
    typeof window === 'undefined' ? process.env.AUTH_SERVICE_URL! : undefined,

  // App identifier for external services.
  appSlug: process.env.NEXT_PUBLIC_APP_SLUG!,

  // Redis Configuration - only available on server side.
  redis: {
    url: typeof window === 'undefined' ? process.env.REDIS_URL! : undefined,
    password:
      typeof window === 'undefined' ? process.env.REDIS_PASSWORD : undefined,
  },

  // Middleware Configuration.
  middleware: {
    apiCallTrackHeader: 'x-api-call-track',
  },

  domain: process.env.NEXT_PUBLIC_APP_DOMAIN!,
  url: process.env.NEXT_PUBLIC_APP_URL!,
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO!,

  author: process.env.NEXT_PUBLIC_APP_AUTHOR!,
  keywords: process.env.NEXT_PUBLIC_APP_KEYWORDS!,
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE!,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL!,

  errorMessages: {
    notFound: process.env.NEXT_PUBLIC_404_MESSAGE!,
    serverError: process.env.NEXT_PUBLIC_500_MESSAGE!,
  },

  // Node environment - only available on server side.
  nodeEnv: typeof window === 'undefined' ? process.env.NODE_ENV! : undefined,

  // OpenAI Configuration - only available on server side.
  openai: {
    apiKey:
      typeof window === 'undefined' ? process.env.OPENAI_API_KEY! : undefined,
    model:
      typeof window === 'undefined'
        ? process.env.OPENAI_MODEL || 'gpt-4o-mini'
        : undefined,
  },
} as const;

export type AppConfig = typeof appConfig;
