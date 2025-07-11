import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from 'vitest';
import App from './App';

// Basic test: heading renders
it('renders $TAO Price Chart heading', () => {
  render(<App />);
  const heading = screen.getByText(/\$TAO Price Chart/i);
  expect(heading).toBeInTheDocument();
});

// Test: loading spinner appears
it('shows loading spinner initially', () => {
  render(<App />);
  const loading = screen.getByText(/loading chart/i);
  expect(loading).toBeInTheDocument();
});

// Test: timeframe selector buttons render
it('renders all timeframe selector buttons', () => {
  render(<App />);
  expect(screen.getByText('7d')).toBeInTheDocument();
  expect(screen.getByText('14d')).toBeInTheDocument();
  expect(screen.getByText('30d')).toBeInTheDocument();
  expect(screen.getByText('6mo')).toBeInTheDocument();
  expect(screen.getByText('1yr')).toBeInTheDocument();
});

// Test: clicking a timeframe button updates the active state
it('updates active button when a timeframe is clicked', () => {
  render(<App />);
  const btn14d = screen.getByText('14d');
  fireEvent.click(btn14d);
  expect(btn14d).toHaveClass('bg-indigo-500');
});

// Test: buttons remain enabled and responsive
it('timeframe buttons remain responsive', () => {
  render(<App />);
  const btn30d = screen.getByText('30d');
  fireEvent.click(btn30d);
  expect(btn30d).toHaveClass('bg-indigo-500');
  const btn7d = screen.getByText('7d');
  fireEvent.click(btn7d);
  expect(btn7d).toHaveClass('bg-indigo-500');
}); 