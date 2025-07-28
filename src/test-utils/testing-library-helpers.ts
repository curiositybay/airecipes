import { act, fireEvent, waitFor, screen } from '@testing-library/react';

// Types into an input and waits for the value to appear in the document.
export const typeAndWait = async (input: HTMLElement, value: string) => {
  fireEvent.change(input, { target: { value } });
  act(() => jest.advanceTimersByTime(500));
  await waitFor(() => expect(screen.getByText(value)).toBeInTheDocument());
};
