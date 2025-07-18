'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
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
          className='block text-sm font-medium mb-1 theme-text-secondary'
        >
          Name *
        </label>
        <input
          id='name'
          {...register('name')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 theme-input-focus ${
            errors.name ? 'theme-border-error' : 'theme-border-input'
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
          className='block text-sm font-medium mb-1 theme-text-secondary'
        >
          Email *
        </label>
        <input
          id='email'
          type='email'
          {...register('email')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 theme-input-focus ${
            errors.email ? 'theme-border-error' : 'theme-border-input'
          }`}
          placeholder='your.email@example.com'
        />
        {errors.email && (
          <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='phone'
          className='block text-sm font-medium mb-1 theme-text-secondary'
        >
          Phone
        </label>
        <input
          id='phone'
          type='tel'
          {...register('phone')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 theme-input-focus ${
            errors.phone ? 'theme-border-error' : 'theme-border-input'
          }`}
          placeholder='+1 (555) 123-4567'
        />
        {errors.phone && (
          <p className='mt-1 text-sm text-red-600'>{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='subject'
          className='block text-sm font-medium mb-1 theme-text-secondary'
        >
          Subject *
        </label>
        <input
          id='subject'
          {...register('subject')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 theme-input-focus ${
            errors.subject ? 'theme-border-error' : 'theme-border-input'
          }`}
          placeholder='What is this about?'
        />
        {errors.subject && (
          <p className='mt-1 text-sm text-red-600'>{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='message'
          className='block text-sm font-medium mb-1 theme-text-secondary'
        >
          Message *
        </label>
        <textarea
          id='message'
          rows={4}
          {...register('message')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 theme-input-focus ${
            errors.message ? 'theme-border-error' : 'theme-border-input'
          }`}
          placeholder='Tell us more...'
        />
        {errors.message && (
          <p className='mt-1 text-sm text-red-600'>{errors.message.message}</p>
        )}
      </div>

      <button
        type='submit'
        disabled={!isValid || isSubmitting}
        className={`w-full py-3 px-4 rounded-md font-semibold theme-text-button transition-colors duration-200 ${
          isValid && !isSubmitting
            ? 'theme-btn-primary'
            : 'theme-bg-neutral-light cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
