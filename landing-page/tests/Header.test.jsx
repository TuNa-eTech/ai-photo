import { render, screen, fireEvent, within } from '@testing-library/react';
import Header from '../src/components/Header.jsx';
import '../src/i18n/index.js';

test('mobile menu toggles via button and closes with ESC', async () => {
  render(<Header />);
  const btn = screen.getByRole('button', { name: /open menu/i });

  // Open mobile menu
  fireEvent.click(btn);
  expect(btn).toHaveAttribute('aria-expanded', 'true');

  // Scope queries to the mobile menu only to avoid desktop duplicates
  const menuEl = document.getElementById('mobile-menu');
  expect(menuEl).toBeInTheDocument();
  expect(within(menuEl).getByText(/Features/i)).toBeInTheDocument();

  // Close with ESC
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(document.getElementById('mobile-menu')).not.toBeInTheDocument();
});
