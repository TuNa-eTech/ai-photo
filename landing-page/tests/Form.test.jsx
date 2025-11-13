import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Contact from '../src/sections/Contact.jsx';
import '../src/i18n/index.js';

global.fetch = vi.fn(() => Promise.resolve({ ok: true }));
vi.mock('../src/utils/recaptcha.js', () => ({
  getRecaptchaToken: () => Promise.resolve('mock-token')
}));

test('validates form fields and submits', async () => {
  render(<Contact />);
  const submit = screen.getByRole('button', { name: /send/i });
  fireEvent.click(submit);
  expect(await screen.findAllByRole('alert')).toBeTruthy();

  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'User' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hi' } });

  fireEvent.click(submit);
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  await screen.findByText(/Thanks!/i);
});
