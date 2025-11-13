import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '../src/i18n/index.js';
import App from '../src/App.jsx';

function renderAt(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
}

describe('Legal pages routing and i18n', () => {
  test('navigates to Privacy Policy via route and renders heading and TOC', async () => {
    renderAt('/privacy');

    // Heading
    const h1 = await screen.findByRole('heading', { level: 1, name: /privacy policy/i });
    expect(h1).toBeInTheDocument();

    // Table of contents nav (aria-label from i18n: "On this page")
    const toc = screen.getByRole('navigation', { name: /on this page/i });
    expect(toc).toBeInTheDocument();

    // A known section link exists
    const link = screen.getByRole('link', { name: /information we collect/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringMatching(/^#collection$/));
  });

  test('navigates to Terms of Service via route and renders heading', async () => {
    renderAt('/terms');
    const h1 = await screen.findByRole('heading', { level: 1, name: /terms of service/i });
    expect(h1).toBeInTheDocument();

    // Known section
    expect(screen.getByRole('link', { name: /acceptance of terms/i })).toBeInTheDocument();
  });

  test('Footer links navigate to legal pages (client-side routing)', async () => {
    const user = userEvent.setup();
    renderAt('/');

    // Footer links
    const privacyLink = screen.getByRole('link', { name: /privacy/i });
    const termsLink = screen.getByRole('link', { name: /terms/i });

    // Click Privacy
    await user.click(privacyLink);
    expect(await screen.findByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument();

    // Click Terms
    await user.click(termsLink);
    expect(await screen.findByRole('heading', { level: 1, name: /terms of service/i })).toBeInTheDocument();
  });
});

describe('A11y basics and dark mode', () => {
  test('Skip to content link exists and targets #main', () => {
    renderAt('/');
    const skip = screen.getByRole('link', { name: /skip to content/i });
    expect(skip).toBeInTheDocument();
    expect(skip).toHaveAttribute('href', '#main');
  });

  test('Dark mode toggle sets documentElement.classList "dark" and persists during navigation', async () => {
    const user = userEvent.setup();
    renderAt('/');

    const toggle = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await user.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Navigate to Privacy and ensure dark remains applied
    const privacyLink = screen.getByRole('link', { name: /privacy/i });
    await user.click(privacyLink);
    expect(await screen.findByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});