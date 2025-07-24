import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import ContactForm from './ContactForm';

// Mock the useFormValidation hook
jest.mock('@/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    values: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
    errors: {},
    touched: {},
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    handleSubmit: jest.fn(),
    isValid: false,
    isSubmitting: false,
  }),
}));

describe('ContactForm', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send message/i })
    ).toBeInTheDocument();
  });

  it('displays error messages when validation fails', async () => {
    render(<ContactForm />);

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', {
      name: /send message/i,
    });

    // The button should be disabled initially since form is invalid
    expect(submitButton).toBeDisabled();

    // Try to trigger validation by clicking the button (even though it's disabled)
    await act(async () => {
      await fireEvent.click(submitButton);
    });

    // Also try to trigger validation by submitting the form directly
    const form = document.querySelector('form');
    if (form) {
      await act(async () => {
        await fireEvent.submit(form);
      });
    }

    // Wait for validation errors to appear - test that errors exist without checking specific text
    await waitFor(() => {
      const errorElements = document.querySelectorAll('p[class*="text-red"]');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  it('displays error styling on fields with errors', async () => {
    render(<ContactForm />);

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', {
      name: /send message/i,
    });

    // The button should be disabled initially since form is invalid
    expect(submitButton).toBeDisabled();

    // Try to trigger validation by clicking the button (even though it's disabled)
    await act(async () => {
      await fireEvent.click(submitButton);
    });

    // Also try to trigger validation by submitting the form directly
    const form = document.querySelector('form');
    if (form) {
      await act(async () => {
        await fireEvent.submit(form);
      });
    }

    // Wait for validation errors to appear
    await waitFor(() => {
      const errorElements = document.querySelectorAll('p[class*="text-red"]');
      expect(errorElements.length).toBeGreaterThan(0);
    });

    // Check that error styling is applied to inputs
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    expect(nameInput).toHaveClass('theme-border-error');
    expect(emailInput).toHaveClass('theme-border-error');
  });

  it('submits form with valid data', async () => {
    // Mock console.log and alert
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ContactForm />);

    // Fill in the form fields with valid data
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' },
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' },
      });
    });

    // Wait for the submit button to become enabled
    const submitButton = await waitFor(() => {
      const btn = screen.getByRole('button', {
        name: /send message/i,
      }) as HTMLButtonElement;
      if (btn.disabled) throw new Error('Button still disabled');
      return btn;
    });

    // Click the submit button
    await act(async () => {
      await fireEvent.click(submitButton);
    });

    // Fast-forward timers to complete the async operation
    jest.runAllTimers();

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Submitting form:', {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message',
        phone: '',
      });
      expect(alertSpy).toHaveBeenCalledWith('Form submitted successfully!');
    });

    // Clean up mocks
    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('accepts valid phone number formats', async () => {
    // Mock console.log and alert
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ContactForm />);

    // Fill in the form fields with valid data including valid phone
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' },
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' },
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '+1234567890' },
      });
    });

    // Wait for the submit button to become enabled
    const submitButton = await waitFor(() => {
      const btn = screen.getByRole('button', {
        name: /send message/i,
      }) as HTMLButtonElement;
      if (btn.disabled) throw new Error('Button still disabled');
      return btn;
    });

    // Click the submit button
    await act(async () => {
      await fireEvent.click(submitButton);
    });

    // Fast-forward timers to complete the async operation
    jest.runAllTimers();

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Submitting form:', {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message',
        phone: '+1234567890',
      });
      expect(alertSpy).toHaveBeenCalledWith('Form submitted successfully!');
    });

    // Clean up mocks
    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('accepts empty phone field as valid', async () => {
    // Mock console.log and alert
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ContactForm />);

    // Fill in the form fields with valid data (no phone)
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' },
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' },
      });
    });

    // Wait for the submit button to become enabled
    const submitButton = await waitFor(() => {
      const btn = screen.getByRole('button', {
        name: /send message/i,
      }) as HTMLButtonElement;
      if (btn.disabled) throw new Error('Button still disabled');
      return btn;
    });

    // Click the submit button
    await act(async () => {
      await fireEvent.click(submitButton);
    });

    // Fast-forward timers to complete the async operation
    jest.runAllTimers();

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Submitting form:', {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message',
        phone: '',
      });
      expect(alertSpy).toHaveBeenCalledWith('Form submitted successfully!');
    });

    // Clean up mocks
    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('shows loading state during submission', async () => {
    render(<ContactForm />);

    // Fill in the form fields with valid data
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' },
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' },
      });
    });

    // Wait for the submit button to become enabled
    const submitButton = await waitFor(() => {
      const btn = screen.getByRole('button', {
        name: /send message/i,
      }) as HTMLButtonElement;
      if (btn.disabled) throw new Error('Button still disabled');
      return btn;
    });

    // Click the submit button
    await act(async () => {
      await fireEvent.click(submitButton);
    });

    // Check that the button shows loading state
    expect(submitButton).toHaveTextContent('Sending...');
    expect(submitButton).toBeDisabled();
  });
});
