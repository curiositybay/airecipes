import Swal from 'sweetalert2';

/**
 * Provides themed SweetAlert2 configurations that align with the app's design system.
 * These configurations use CSS variables defined in the theme, ensuring consistency.
 */
export const themedSwal = {
  /**
   * Shows a confirmation dialog with themed styling.
   */
  confirm: (options: {
    title: string;
    text?: string;
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
    confirmButtonText?: string;
    cancelButtonText?: string;
  }) => {
    return Swal.fire({
      ...options,
      showCancelButton: true,
      // Remove hardcoded colors - CSS will handle theming
      confirmButtonText: options.confirmButtonText || 'Confirm',
      cancelButtonText: options.cancelButtonText || 'Cancel',
    });
  },

  /**
   * Shows an info dialog with themed styling.
   */
  info: (options: {
    title: string;
    text?: string;
    confirmButtonText?: string;
  }) => {
    return Swal.fire({
      ...options,
      icon: 'info',
      confirmButtonText: options.confirmButtonText || 'OK',
    });
  },

  /**
   * Shows a success dialog with themed styling.
   */
  success: (options: {
    title: string;
    text?: string;
    confirmButtonText?: string;
  }) => {
    return Swal.fire({
      ...options,
      icon: 'success',
      confirmButtonText: options.confirmButtonText || 'OK',
    });
  },

  /**
   * Shows a warning dialog with themed styling.
   */
  warning: (options: {
    title: string;
    text?: string;
    confirmButtonText?: string;
  }) => {
    return Swal.fire({
      ...options,
      icon: 'warning',
      confirmButtonText: options.confirmButtonText || 'OK',
    });
  },

  /**
   * Shows an error dialog with themed styling.
   */
  error: (options: {
    title: string;
    text?: string;
    confirmButtonText?: string;
  }) => {
    return Swal.fire({
      ...options,
      icon: 'error',
      confirmButtonText: options.confirmButtonText || 'OK',
    });
  },

  /**
   * Shows a custom dialog with full SweetAlert2 options and themed styling.
   */
  custom: (options: Parameters<typeof Swal.fire>[0]) => {
    return Swal.fire(options);
  },
};
