import React from 'react';

/**
 * Mocks for React components used in app directory tests.
 */

export const mockServerErrorPage = jest
  .fn()
  .mockImplementation(({ reset }: { reset: () => void }) => {
    const handleReturnClick = () => {
      // Simulate router navigation
      const mockRouter = { push: jest.fn() };
      mockRouter.push('/');
      return mockRouter.push;
    };

    return React.createElement(
      'div',
      { 'data-testid': 'server-error-page' },
      React.createElement('h1', null, 'Server Error'),
      React.createElement('p', null, 'Something went wrong'),
      React.createElement('button', { onClick: reset }, 'Try Again'),
      React.createElement(
        'button',
        { onClick: handleReturnClick },
        'Return to Home'
      )
    );
  });

export const mockErrorPage = jest
  .fn()
  .mockImplementation(
    ({
      code,
      title,
      message,
      icon,
      customActions,
    }: {
      code: number;
      title: string;
      message: string;
      icon: string;
      customActions?: React.ReactNode;
    }) => {
      return React.createElement(
        'div',
        { 'data-testid': 'error-page' },
        React.createElement('h1', null, code),
        React.createElement('h2', null, title),
        React.createElement('p', null, message),
        React.createElement('i', { className: `fas ${icon}` }),
        customActions ||
          React.createElement(
            'a',
            { href: '/' },
            React.createElement('button', null, 'Return to Mock App')
          )
      );
    }
  );

export const mockAIMealsPage = jest.fn().mockImplementation(() => {
  return React.createElement(
    'div',
    { 'data-testid': 'ai-meals-page' },
    'AI Meals Page'
  );
});

export const mockAuthProvider = jest
  .fn()
  .mockImplementation(
    ({
      children,
      initialUser,
    }: {
      children: React.ReactNode;
      initialUser: unknown;
    }) => {
      return React.createElement(
        'div',
        {
          'data-testid': 'auth-provider',
          'data-user': JSON.stringify(initialUser),
        },
        children
      );
    }
  );

export const mockStructuredData = jest.fn().mockImplementation(() => {
  return React.createElement(
    'div',
    { 'data-testid': 'structured-data' },
    'Structured Data'
  );
});

export const mockLayout = jest
  .fn()
  .mockImplementation(({ children }: { children: React.ReactNode }) => {
    return React.createElement('div', { 'data-testid': 'layout' }, children);
  });

export const mockThemeProvider = jest
  .fn()
  .mockImplementation(
    ({
      children,
      initialTheme,
    }: {
      children: React.ReactNode;
      initialTheme: string;
    }) => {
      return React.createElement(
        'div',
        { 'data-testid': 'theme-provider', 'data-theme': initialTheme },
        children
      );
    }
  );

export const setupReactComponentMocks = () => {
  jest.mock('@/components/UI/ServerErrorPage', () => ({
    __esModule: true,
    default: mockServerErrorPage,
  }));

  jest.mock('@/components/UI/ErrorPage', () => ({
    __esModule: true,
    default: mockErrorPage,
  }));

  jest.mock('@/components/AIMeals/AIMealsPage', () => ({
    __esModule: true,
    default: mockAIMealsPage,
  }));

  jest.mock('@/contexts/AuthContext', () => ({
    __esModule: true,
    AuthProvider: mockAuthProvider,
  }));

  jest.mock('@/components/StructuredData', () => ({
    __esModule: true,
    default: mockStructuredData,
  }));

  jest.mock('@/components/Layout/Layout', () => ({
    __esModule: true,
    default: mockLayout,
  }));

  jest.mock('@/contexts/ThemeContext', () => ({
    __esModule: true,
    ThemeProvider: mockThemeProvider,
  }));
};
