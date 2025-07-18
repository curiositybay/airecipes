import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import ContactForm from './ContactForm';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('ContactForm', () => {
  it('renders all form fields', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
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

    // Wait for validation errors to appear
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
    expect(await screen.findByText('Subject is required')).toBeInTheDocument();
    expect(await screen.findByText('Message is required')).toBeInTheDocument();
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
    await screen.findByText('Name is required');
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    expect(nameInput).toHaveClass('border-red-500');
    expect(emailInput).toHaveClass('border-red-500');
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

  it('shows loading state when submitting', async () => {
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
    expect(
      screen.getByRole('button', { name: /sending/i })
    ).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles optional phone field', async () => {
    // Mock console.log and alert
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ContactForm />);

    // Fill in the form fields with valid data (including phone)
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

  it('validates email format', async () => {
    render(<ContactForm />);

    // Fill in fields with invalid email
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid-email' },
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' },
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' },
      });
    });

    // Try to submit
    const submitButton = screen.getByRole('button', {
      name: /send message/i,
    });
    await act(async () => {
      await fireEvent.click(submitButton);
    });

    // Check for email validation error
    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
  });

  it('validates phone number format', async () => {
    render(<ContactForm />);

    // Fill in fields with valid data but invalid phone
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
        target: { value: 'invalid-phone' },
      });
    });

    // Try to submit
    const submitButton = screen.getByRole('button', {
      name: /send message/i,
    });
    await act(async () => {
      await fireEvent.click(submitButton);
    });

    // Check for phone validation error
    expect(
      await screen.findByText('Please enter a valid phone number')
    ).toBeInTheDocument();
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
});
