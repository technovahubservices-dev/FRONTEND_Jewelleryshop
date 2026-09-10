import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Contact from '../pages/Contact';

const mockCreateContact = vi.fn();

vi.mock('../services/api', () => ({
  contactAPI: {
    create: (...args) => mockCreateContact(...args),
  },
}));

vi.mock('../utils/apiUrl', () => ({
  resolveImageUrl: vi.fn((url) => url || ''),
}));

const renderWithRouter = (initialEntries = ['/contact']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Contact />
    </MemoryRouter>
  );

const fillForm = async (name, email, message) => {
  const nameInput = screen.getByLabelText(/customer name/i);
  const emailInput = screen.getByLabelText(/customer email/i);
  const messageInput = screen.getByLabelText(/message/i);

  await act(async () => {
    fireEvent.change(nameInput, { target: { value: name } });
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(messageInput, { target: { value: message } });
  });
};

describe('Contact Us Page', () => {
  beforeEach(() => {
    mockCreateContact.mockReset();
  });

  it('renders contact page heading', () => {
    renderWithRouter();
    expect(screen.getByText('Contact Us')).toBeDefined();
    expect(screen.getByText('Send Us a Message')).toBeDefined();
  });

  it('preserves existing company details section', () => {
    renderWithRouter();
    expect(screen.getByText('JKR Jewellery')).toBeDefined();
    expect(screen.getByText('Visit Our Store')).toBeDefined();
    expect(screen.getByText(/123, Heritage Lane/)).toBeDefined();
    expect(screen.getByText('Email Us')).toBeDefined();
  });

  it('submits the contact form through the API', async () => {
    mockCreateContact.mockResolvedValue({ data: { success: true, data: { _id: 'msg1' } } });

    renderWithRouter();

    await fillForm('John Doe', 'john@example.com', 'I have a question about your rings.');

    await act(async () => {
      fireEvent.click(screen.getByText('Send Message'));
    });

    await waitFor(() => {
      expect(mockCreateContact).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'I have a question about your rings.',
      });
    });
  });

  it('shows success message after successful submission', async () => {
    mockCreateContact.mockResolvedValue({ data: { success: true, data: { _id: 'msg1' } } });

    renderWithRouter();

    await fillForm('Jane Smith', 'jane@test.com', 'I would like to place a custom order.');

    await act(async () => {
      fireEvent.click(screen.getByText('Send Message'));
    });

    await waitFor(() => {
      expect(screen.getByText('Thank you for reaching out!')).toBeDefined();
      expect(screen.getByText('We will get back to you within 24 hours.')).toBeDefined();
    });

    expect(mockCreateContact).toHaveBeenCalledTimes(1);
  });

  it('shows error message when API submission fails', async () => {
    mockCreateContact.mockRejectedValue({
      response: { data: { message: 'Server unavailable' } },
    });

    renderWithRouter();

    await fillForm('Jane Smith', 'jane@test.com', 'I have a question.');

    await act(async () => {
      fireEvent.click(screen.getByText('Send Message'));
    });

    await waitFor(() => {
      expect(screen.getByText('Server unavailable')).toBeDefined();
    });
  });

  it('shows error message when API request fails', async () => {
    mockCreateContact.mockRejectedValue(new Error('Network error'));

    renderWithRouter();

    await fillForm('Jane Smith', 'jane@test.com', 'I have a question.');

    await act(async () => {
      fireEvent.click(screen.getByText('Send Message'));
    });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeDefined();
    });
  });

  it('does not submit when form fields are empty', async () => {
    renderWithRouter();

    await act(async () => {
      fireEvent.click(screen.getByText('Send Message'));
    });

    expect(mockCreateContact).not.toHaveBeenCalled();
  });

  it('disables submit button while submitting', async () => {
    mockCreateContact.mockImplementation(() => new Promise(() => {}));

    renderWithRouter();

    await fillForm('John Doe', 'john@example.com', 'Test message');

    await act(async () => {
      fireEvent.click(screen.getByText('Send Message'));
    });

    expect(screen.getByText('Sending...')).toBeDefined();
    expect(screen.getByText('Sending...').closest('button')).toBeDisabled();
  });

  it('clears form and shows success view after successful submission', async () => {
    mockCreateContact.mockResolvedValue({ data: { success: true, data: { _id: 'msg1' } } });

    renderWithRouter();

    await fillForm('John Doe', 'john@example.com', 'Test message');

    await act(async () => {
      fireEvent.click(screen.getByText('Send Message'));
    });

    await waitFor(() => {
      expect(screen.getByText('Thank you for reaching out!')).toBeDefined();
    });

    const nameInput = screen.queryByLabelText(/customer name/i);
    const emailInput = screen.queryByLabelText(/customer email/i);
    const messageInput = screen.queryByLabelText(/message/i);

    expect(nameInput).toBeNull();
    expect(emailInput).toBeNull();
    expect(messageInput).toBeNull();
  });

  it('allows sending another message after success', async () => {
    mockCreateContact.mockResolvedValue({ data: { success: true, data: { _id: 'msg1' } } });

    renderWithRouter();

    await fillForm('John Doe', 'john@example.com', 'First message');

    await act(async () => {
      fireEvent.click(screen.getByText('Send Message'));
    });

    await waitFor(() => {
      expect(screen.getByText('Thank you for reaching out!')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Send another message'));
    });

    expect(screen.getByText('Send Message')).toBeDefined();
    expect(screen.getByLabelText(/customer name/i)).toBeDefined();
  });

  it('shows error message when API returns success: false', async () => {
    mockCreateContact.mockResolvedValue({
      data: { success: false, message: 'Failed to save message' },
    });

    renderWithRouter();

    await fillForm('John Doe', 'john@example.com', 'Test message');

    await act(async () => {
      fireEvent.click(screen.getByText('Send Message'));
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to save message')).toBeDefined();
    });

    expect(screen.getByText('Send Message')).toBeDefined();
  });
});
