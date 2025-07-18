'use client';

import { useRouter } from 'next/navigation';

interface ErrorInfo {
  errorCode: number;
  title: string;
  message: string;
}

export const useErrorHandler = () => {
  const router = useRouter();

  const showErrorPage = (
    errorCode: number,
    title: string,
    message: string
  ): void => {
    const errorInfo: ErrorInfo = {
      errorCode,
      title,
      message,
    };
    sessionStorage.setItem('errorInfo', JSON.stringify(errorInfo));

    router.push('/error');
  };

  const show404 = (): void => {
    showErrorPage(
      404,
      'Page Not Found',
      "The page you're looking for doesn't exist."
    );
  };

  const show500 = (message?: string): void => {
    const errorMessage =
      message || 'Something went wrong on our end. Please try again later.';
    showErrorPage(500, 'Server Error', errorMessage);
  };

  const show403 = (): void => {
    showErrorPage(
      403,
      'Access Denied',
      "You don't have permission to access this page."
    );
  };

  const showCustomError = (title: string, message: string): void => {
    showErrorPage(500, title, message);
  };

  return {
    showErrorPage,
    show404,
    show500,
    show403,
    showCustomError,
  };
};
