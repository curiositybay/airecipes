import { themedSwal } from './swal-theme';

// Use the existing sweetalert2 mock
jest.mock('sweetalert2');

// Import the mocked module
import Swal from 'sweetalert2';

describe('themedSwal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('confirm', () => {
    it('should use default button text when not provided', () => {
      const options = {
        title: 'Test Title',
        text: 'Test Text',
        icon: 'question' as const,
      };

      themedSwal.confirm(options);

      expect(Swal.fire).toHaveBeenCalledWith({
        ...options,
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
      });
    });
  });

  describe('info', () => {
    it('should call Swal.fire with info icon and default button text', () => {
      const options = {
        title: 'Info Title',
        text: 'Info Text',
      };

      themedSwal.info(options);

      expect(Swal.fire).toHaveBeenCalledWith({
        ...options,
        icon: 'info',
        confirmButtonText: 'OK',
      });
    });
  });

  describe('success', () => {
    it('should call Swal.fire with success icon and default button text', () => {
      const options = {
        title: 'Success Title',
        text: 'Success Text',
      };

      themedSwal.success(options);

      expect(Swal.fire).toHaveBeenCalledWith({
        ...options,
        icon: 'success',
        confirmButtonText: 'OK',
      });
    });
  });

  describe('warning', () => {
    it('should call Swal.fire with warning icon and default button text', () => {
      const options = {
        title: 'Warning Title',
        text: 'Warning Text',
      };

      themedSwal.warning(options);

      expect(Swal.fire).toHaveBeenCalledWith({
        ...options,
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    });
  });

  describe('error', () => {
    it('should call Swal.fire with error icon and default button text', () => {
      const options = {
        title: 'Error Title',
        text: 'Error Text',
      };

      themedSwal.error(options);

      expect(Swal.fire).toHaveBeenCalledWith({
        ...options,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    });
  });

  describe('custom', () => {
    it('should call Swal.fire with full custom options', () => {
      const customOptions = {
        title: 'Custom Title',
        text: 'Custom Text',
        icon: 'info' as const,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'custom-popup',
        },
      };

      themedSwal.custom(
        customOptions as unknown as Parameters<typeof Swal.fire>[0]
      );

      expect(Swal.fire).toHaveBeenCalledWith(customOptions);
    });
  });
});
