// Auth service verification request payload.
export interface AuthVerificationRequest {
  app_name: string;
}

// Auth service verification response structure.
export interface AuthVerificationResponse {
  success: boolean;
  status?: string;
  message?: string;
  user?: AuthUser;
}

// User data structure from auth service.
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Type guard to validate auth verification response.
export function isAuthVerificationResponse(
  data: unknown
): data is AuthVerificationResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof (data as AuthVerificationResponse).success === 'boolean'
  );
}

// Type guard to validate auth user data.
export function isAuthUser(user: unknown): user is AuthUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'email' in user &&
    typeof (user as AuthUser).id === 'string' &&
    typeof (user as AuthUser).email === 'string'
  );
}

// Cached auth result structure.
export interface CachedAuthResult {
  user: AuthUser;
  appSlug: string;
  tokenHash: string;
  expires: number;
  createdAt: number;
}

// Type guard to validate cached auth result.
export function isCachedAuthResult(data: unknown): data is CachedAuthResult {
  return (
    typeof data === 'object' &&
    data !== null &&
    'user' in data &&
    'appSlug' in data &&
    'tokenHash' in data &&
    'expires' in data &&
    'createdAt' in data &&
    isAuthUser((data as CachedAuthResult).user) &&
    typeof (data as CachedAuthResult).appSlug === 'string' &&
    typeof (data as CachedAuthResult).tokenHash === 'string' &&
    typeof (data as CachedAuthResult).expires === 'number' &&
    typeof (data as CachedAuthResult).createdAt === 'number'
  );
}
