# Unified Mock Utilities

A comprehensive mock system that solves timing issues, over-mocking, and duplication across test files.

## 🎯 Quick Decision Guide

| What You're Testing                                | Mocking Strategy                                     | Example                                                             |
| -------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| **Component with its own test file**               | ✅ Test actual implementation, mock child components | `ThemeSwitcher.test.tsx` tests real component, mocks `ToggleButton` |
| **Component used by other components**             | ✅ Mock in parent component's test file              | Mock `ChildComponent` in `ParentComponent.test.tsx`                 |
| **Context with path alias (`@/contexts/*`)**       | ✅ Mock in individual test files                     | `jest.mock('@/contexts/ThemeContext')`                              |
| **External libraries**                             | ✅ Use Jest automatic mocks                          | `jest.mock('axios')`                                                |
| **Common utilities (localStorage, fetch)**         | ✅ Use unified mocks                                 | `mocks.setup.frontend.setupLocalStorage()`                          |
| **Internal modules with path aliases (`@/lib/*`)** | ✅ Use unified mocks                                 | `mocks.setup.validation()`                                          |
| **Server-side modules**                            | ✅ Use `@jest-environment node`                      | `auth.server.test.ts` with Node environment                         |

## ❌ Common Mistakes

```typescript
// ❌ DON'T: Mock components that have their own test files
jest.mock('@/components/MyComponent', () => ({ ... }));

// ❌ DON'T: Use unified mocks for simple component tests
mocks.setup.all(); // Over-mocking

// ❌ DON'T: Test server-side modules in browser environment
// This will fail because window is defined
describe('auth', () => {
  it('should work', () => {
    // This will throw "Auth service URL is only available on server side"
  });
});
```

## ✅ Correct Patterns

```typescript
// ✅ DO: Mock child components in parent tests
jest.mock('./ChildComponent', () => ({ ... }));

// ✅ DO: Test actual component implementations
render(<MyComponent />);

// ✅ DO: Use unified API for common utilities
import { mocks } from '@/test-utils/mocks/mocks';
mocks.setup.fetch();

// ✅ DO: Use Node environment for server-side modules
/**
 * @jest-environment node
 */
describe('auth Server-Side Tests', () => {
  // Test server-side specific logic
});
```

## Usage Examples

### Component Testing

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';

// ✅ Mock context in test file
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

// ✅ Mock child component in test file
jest.mock('./ToggleButton', () => ({
  ToggleButton: ({ onClick, icon, ariaLabel }) => (
    <button onClick={onClick} data-testid="theme-toggle" aria-label={ariaLabel}>
      <i className={icon} data-testid="theme-icon"></i>
    </button>
  ),
}));

describe('ThemeSwitcher', () => {
  it('should handle theme toggle', () => {
    render(<ThemeSwitcher />);
    // ... test logic
  });
});
```

### Backend Testing

```typescript
import { mocks } from '@/test-utils/mocks/mocks';

describe('API Route Tests', () => {
  beforeEach(() => {
    mocks.setup.fetch();
    mocks.setup.auth();
  });

  afterEach(() => {
    mocks.setup.clear();
  });

  it('should handle authentication', async () => {
    mocks.mock.http.authSuccess();
    mocks.mock.auth.requireAuth.mockResolvedValue(
      mocks.mock.auth.mockAuthSuccess
    );
    // ... test logic
  });
});
```

## Available Mocks

```typescript
import { mocks } from '@/test-utils/mocks/mocks';

// Backend
mocks.mock.http.authSuccess();
mocks.mock.auth.requireAuth.mockResolvedValue(user);
mocks.mock.prisma.client.user.findMany.mockResolvedValue(users);

// Frontend
mocks.setup.frontend.setupLocalStorage();
mocks.setup.frontend.setupScrollIntoView();

// Setup
mocks.setup.forComponent('AIMealsPage'); // localStorage, fetch, scrollIntoView
mocks.setup.forAPI(); // fetch, auth, prisma
```

## Path Alias Limitation

**Problem**: Jest's automatic mocking doesn't work with path aliases like `@/`.

**Solution**: Use unified architecture for modules with path aliases.

**Examples**:

- `@/lib/validation` → Use unified mocks
- `axios` → Use automatic mocks
- `@/contexts/AuthContext` → Mock in test file

## Server-Side Testing

**Problem**: Some modules use server-side only features (e.g., `typeof window !== 'undefined'` checks, server-only environment variables) that don't work in the default Jest environment.

**Solution**: Create separate test files with `@jest-environment node` directive.

### When to Use Server-Side Tests

- **Server-only modules** that check for `typeof window !== 'undefined'`
- **Environment variable handling** that's different on server vs client
- **Node.js specific APIs** that aren't available in browser environment
- **Server-side authentication** or configuration modules

### Server-Side Test Structure

```typescript
/**
 * @jest-environment node
 */

/**
 * Server-side only tests for the module.
 *
 * These tests verify that server-side only configurations work correctly
 * when running in a Node environment where window is undefined.
 */
import { NextRequest } from 'next/server';
import { verifyAuth, requireAuth } from './auth';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('auth Server-Side Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should handle server-side scenarios', async () => {
    // Test server-side specific logic
  });
});
```

### Key Differences from Regular Tests

1. **Environment Directive**: Add `@jest-environment node` at the top
2. **Global Mocks**: Mock `global.fetch` instead of using unified mocks
3. **Environment Variables**: Handle `process.env` properly
4. **Module Reset**: Use `jest.resetModules()` to get fresh imports
5. **Window Object**: Test client-side error paths by temporarily setting `global.window`

### Examples

- **`src/config/app.server.test.ts`** - Tests server-side config handling
- **`src/lib/auth.server.test.ts`** - Tests server-side authentication
- **`src/lib/redis.server.test.ts`** - Tests server-side database connections

### Testing Client-Side Error Paths

```typescript
it('should handle client-side environment error', async () => {
  // Temporarily set up client-side environment
  const originalWindow = global.window;
  (global as { window?: unknown }).window = {};

  // Re-import to get fresh config
  jest.resetModules();
  const { someFunction } = await import('./module');

  const result = await someFunction();
  expect(result).toEqual({
    success: false,
    error: 'Function is only available on server side',
  });

  // Restore
  global.window = originalWindow;
});
```

## Best Practices

1. **✅ Use selective setup** - Only mock what you need
2. **✅ Test actual implementations** - Don't mock components with their own test files
3. **✅ Mock child components** - In parent component test files
4. **✅ Use unified API** - For common utilities and complex mocks
5. **✅ Clear mocks properly** - Always clean up after tests
6. **✅ Use Node environment** - For server-side modules that check `typeof window`
7. **✅ Handle environment variables** - Reset `process.env` in server-side tests
