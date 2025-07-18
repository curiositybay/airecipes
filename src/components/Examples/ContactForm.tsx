'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PrimaryButton } from '@/components/UI/Button';
import { getTheme } from '@/config/theme';

const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message must be less than 1000 characters'),
  phone: z
    .string()
    .optional()
    .refine(val => {
      if (!val) return true; // Optional field, empty is valid
      // Basic phone number validation: allows digits, spaces, dashes, parentheses, and plus sign
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(val.replace(/[\s\-\(\)]/g, ''));
    }, 'Please enter a valid phone number'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const theme = getTheme('ocean');
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: 'all',
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      phone: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    // Simulate API call
    console.log('Submitting form:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Form submitted successfully!');
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='max-w-md mx-auto space-y-6'
    >
      <div>
        <label
          htmlFor='name'
          className={`block text-sm font-medium mb-1 ${theme.colors.text.secondary}`}
        >
          Name *
        </label>
        <input
          id='name'
          {...register('name')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${theme.colors.text.iconPrimary} ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='Your name'
        />
        {errors.name && (
          <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='email'
          className={`block text-sm font-medium mb-1 ${theme.colors.text.secondary}`}
        >
          Email *
        </label>
        <input
          id='email'
          type='email'
          {...register('email')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${theme.colors.text.iconPrimary} ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='your@email.com'
        />
        {errors.email && (
          <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='subject'
          className={`block text-sm font-medium mb-1 ${theme.colors.text.secondary}`}
        >
          Subject *
        </label>
        <input
          id='subject'
          {...register('subject')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${theme.colors.text.iconPrimary} ${
            errors.subject ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='Subject'
        />
        {errors.subject && (
          <p className='mt-1 text-sm text-red-600'>{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='phone'
          className={`block text-sm font-medium mb-1 ${theme.colors.text.secondary}`}
        >
          Phone (optional)
        </label>
        <input
          id='phone'
          type='tel'
          {...register('phone')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${theme.colors.text.iconPrimary} ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='+1 (555) 123-4567'
        />
        {errors.phone && (
          <p className='mt-1 text-sm text-red-600'>{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='message'
          className={`block text-sm font-medium mb-1 ${theme.colors.text.secondary}`}
        >
          Message *
        </label>
        <textarea
          id='message'
          rows={4}
          {...register('message')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${theme.colors.text.iconPrimary} ${
            errors.message ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='Your message...'
        />
        {errors.message && (
          <p className='mt-1 text-sm text-red-600'>{errors.message.message}</p>
        )}
      </div>

      <PrimaryButton
        type='submit'
        disabled={!isValid || isSubmitting}
        className='w-full'
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </PrimaryButton>
    </form>
  );
}
