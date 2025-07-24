import { Metadata } from 'next';
import { cookies } from 'next/headers';
import AIMealsPage from '@/components/AIMeals/AIMealsPage';
import { appConfig } from '@/config/app';
import { AuthUser } from '@/lib/auth';
import { AuthProvider } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `AI Recipe Generator - ${appConfig.name}`,
  description:
    'Generate delicious recipes from your available ingredients using AI. Get personalized meal suggestions and cooking instructions.',
  keywords:
    'AI recipes, meal planning, cooking, ingredients, food, recipe generator',
};

async function getServerSideUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return null;
    }

    // Check if the token is expired by decoding it (JWT tokens contain expiration info)
    try {
      const tokenParts = authToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString()
        );
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < currentTime) {
          // Token is expired, return null immediately
          return null;
        }
      }
    } catch {
      // If we can't decode the token, proceed with the auth service call
      // The auth service will handle invalid token formats
    }

    // Verify the token with the auth service
    const response = await fetch(
      `${appConfig.authServiceUrl}/api/v1/auth/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ app_name: 'airecipes' }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        return data.user;
      }
    }

    return null;
  } catch (error) {
    console.error('Server-side auth check error:', error);
    return null;
  }
}

export default async function Home() {
  const user = await getServerSideUser();

  return (
    <AuthProvider initialUser={user}>
      <AIMealsPage />
    </AuthProvider>
  );
}
