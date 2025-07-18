import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  urlSchema,
  phoneSchema,
  userSchema,
  userUpdateSchema,
  contactFormSchema,
  loginFormSchema,
  registerFormSchema,
  apiResponseSchema,
  paginationSchema,
  searchSchema,
  fileUploadSchema,
  userSettingsSchema,
} from './schemas';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });

    it('should reject empty strings', () => {
      expect(() => emailSchema.parse('')).toThrow('Email is required');
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = ['Password123', 'MySecurePass1', 'ComplexP@ss1'];

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'short',
        'nouppercase123',
        'NOLOWERCASE123',
        'NoNumbers',
        '12345678',
      ];

      invalidPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(() => passwordSchema.parse('Pass1')).toThrow(
        'Password must be at least 8 characters'
      );
    });
  });

  describe('urlSchema', () => {
    it('should validate valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://api.example.com/path?param=value',
      ];

      validUrls.forEach(url => {
        expect(() => urlSchema.parse(url)).not.toThrow();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = ['not-a-url', 'http://', 'https://'];

      invalidUrls.forEach(url => {
        expect(() => urlSchema.parse(url)).toThrow();
      });
    });

    it('should accept undefined values', () => {
      expect(() => urlSchema.parse(undefined)).not.toThrow();
    });
  });

  describe('phoneSchema', () => {
    it('should validate valid phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '1234567890',
        '+44123456789',
        '123456789012345',
      ];

      validPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).not.toThrow();
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        'abcdefghij',
        '0123456789', // starts with 0
        '+0123456789', // starts with 0 after +
        '12345678901234567', // too long (17 digits)
      ];

      invalidPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).toThrow();
      });
    });

    it('should accept undefined values', () => {
      expect(() => phoneSchema.parse(undefined)).not.toThrow();
    });
  });

  describe('userSchema', () => {
    it('should validate valid user data', () => {
      const validUser = {
        email: 'user@example.com',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      };

      expect(() => userSchema.parse(validUser)).not.toThrow();
    });

    it('should reject invalid user data', () => {
      const invalidUser = {
        email: 'invalid-email',
        name: '',
        avatar: 'not-a-url',
      };

      expect(() => userSchema.parse(invalidUser)).toThrow();
    });

    it('should accept optional fields', () => {
      const userWithOptionals = {
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => userSchema.parse(userWithOptionals)).not.toThrow();
    });
  });

  describe('userUpdateSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        name: 'Jane Doe',
      };

      expect(() => userUpdateSchema.parse(partialUpdate)).not.toThrow();
    });

    it('should validate provided fields', () => {
      const invalidUpdate = {
        email: 'invalid-email',
      };

      expect(() => userUpdateSchema.parse(invalidUpdate)).toThrow();
    });
  });

  describe('contactFormSchema', () => {
    it('should validate valid contact form data', () => {
      const validForm = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Hello, this is a test message.',
        phone: '+1234567890',
      };

      expect(() => contactFormSchema.parse(validForm)).not.toThrow();
    });

    it('should reject invalid contact form data', () => {
      const invalidForm = {
        name: '',
        email: 'invalid-email',
        message: 'Too short',
        phone: 'invalid-phone',
      };

      expect(() => contactFormSchema.parse(invalidForm)).toThrow();
    });
  });

  describe('loginFormSchema', () => {
    it('should validate valid login data', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'Password123',
      };

      expect(() => loginFormSchema.parse(validLogin)).not.toThrow();
    });

    it('should reject invalid login data', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'weak',
      };

      expect(() => loginFormSchema.parse(invalidLogin)).toThrow();
    });
  });

  describe('registerFormSchema', () => {
    it('should validate valid registration data', () => {
      const validRegister = {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      expect(() => registerFormSchema.parse(validRegister)).not.toThrow();
    });

    it('should reject mismatched passwords', () => {
      const invalidRegister = {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      };

      expect(() => registerFormSchema.parse(invalidRegister)).toThrow();
    });
  });

  describe('apiResponseSchema', () => {
    it('should validate successful API response', () => {
      const dataSchema = z.object({ message: z.string() });
      const responseSchema = apiResponseSchema(dataSchema);

      const successResponse = {
        success: true,
        data: { message: 'Success' },
        message: 'Operation completed',
      };

      expect(() => responseSchema.parse(successResponse)).not.toThrow();
    });

    it('should validate error API response', () => {
      const dataSchema = z.object({ message: z.string() });
      const responseSchema = apiResponseSchema(dataSchema);

      const errorResponse = {
        success: false,
        data: { message: 'Error' },
        message: 'Error occurred',
      };

      expect(() => responseSchema.parse(errorResponse)).not.toThrow();
    });
  });

  describe('paginationSchema', () => {
    it('should validate valid pagination parameters', () => {
      const validPagination = {
        page: 1,
        limit: 10,
        total: 100,
      };

      expect(() => paginationSchema.parse(validPagination)).not.toThrow();
    });

    it('should reject invalid pagination parameters', () => {
      const invalidPagination = {
        page: -1,
        limit: 0,
        total: -5,
      };

      expect(() => paginationSchema.parse(invalidPagination)).toThrow();
    });
  });

  describe('searchSchema', () => {
    it('should validate valid search parameters', () => {
      const validSearch = {
        query: 'test search',
        filters: { category: 'test' },
        sortBy: 'name',
        sortOrder: 'asc',
      };

      expect(() => searchSchema.parse(validSearch)).not.toThrow();
    });

    it('should accept minimal search parameters', () => {
      const minimalSearch = {
        query: 'test',
      };

      expect(() => searchSchema.parse(minimalSearch)).not.toThrow();
    });
  });

  describe('fileUploadSchema', () => {
    it('should validate valid file upload data', () => {
      const mockFile = new File(['test'], 'test.jpg', {
        type: 'image/jpeg',
      });
      const validFile = {
        file: mockFile,
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png'],
      };

      expect(() => fileUploadSchema.parse(validFile)).not.toThrow();
    });

    it('should reject invalid file data', () => {
      const invalidFile = {
        name: '',
        type: 'invalid/type',
        size: -1,
      };

      expect(() => fileUploadSchema.parse(invalidFile)).toThrow();
    });
  });

  describe('userSettingsSchema', () => {
    it('should validate valid user settings', () => {
      const validSettings = {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          sms: false,
        },
        privacy: {
          profileVisibility: 'public',
          allowMessages: true,
        },
      };

      expect(() => userSettingsSchema.parse(validSettings)).not.toThrow();
    });

    it('should accept partial settings', () => {
      const partialSettings = {
        theme: 'light',
      };

      expect(() => userSettingsSchema.parse(partialSettings)).not.toThrow();
    });
  });

  describe('Type exports', () => {
    it('should export all required schemas', () => {
      // These tests ensure schemas are properly exported and can be used
      expect(typeof userSchema).toBe('object');
      expect(typeof userUpdateSchema).toBe('object');
      expect(typeof contactFormSchema).toBe('object');
      expect(typeof loginFormSchema).toBe('object');
      expect(typeof registerFormSchema).toBe('object');
      expect(typeof paginationSchema).toBe('object');
      expect(typeof searchSchema).toBe('object');
      expect(typeof userSettingsSchema).toBe('object');
    });
  });
});
