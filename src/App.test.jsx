import { render, screen } from '@testing-library/react';
import App from './App';

// Basic test: heading renders
it('renders $TAO Tracker heading', () => {
  render(<App />);
  const heading = screen.getByText(/\$TAO Tracker/i);
  expect(heading).toBeInTheDocument();
});

// Test: loading spinner appears
it('shows loading spinner initially', () => {
  render(<App />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
}); 