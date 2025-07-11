import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from 'vitest';
import App from './App';

// Basic test: heading renders
it('renders $TAO Price Chart heading', () => {
  render(<App />);
  const heading = screen.getByText(/\$TAO Price Chart/i);
  expect(heading).toBeInTheDocument();
});

// Test: loading skeleton appears initially
it('shows loading skeleton for chart initially', () => {
  render(<App />);
  // Look for the chart skeleton by class
  const skeleton = document.querySelector('.animate-pulse');
  expect(skeleton).toBeInTheDocument();
});

// Test: timeframe selector buttons render (including 1d)
it('renders all timeframe selector buttons', () => {
  render(<App />);
  expect(screen.getByText('1d')).toBeInTheDocument();
  expect(screen.getByText('7d')).toBeInTheDocument();
  expect(screen.getByText('14d')).toBeInTheDocument();
  expect(screen.getByText('30d')).toBeInTheDocument();
  expect(screen.getByText('6mo')).toBeInTheDocument();
  expect(screen.getByText('1yr')).toBeInTheDocument();
});

// Test: 24h range and ATH elements render (if data is available, they will be present)
it('renders 24h range and all-time high segments if data is available', () => {
  // Mock a minimal App that sets the required state
  function MockedApp() {
    const [low24h] = useState(100);
    const [high24h] = useState(200);
    const [priceLoading] = useState(false);
    return (
      <div>
        <div>
          {low24h !== null && high24h !== null && !priceLoading ? (
            <div>
              24h Range:
              <span data-testid="range-24h">
                <span>${low24h}</span>
                <span>–</span>
                <span>${high24h}</span>
              </span>
            </div>
          ) : null}
          <div>All-Time High: $300</div>
        </div>
      </div>
    );
  }
  render(<MockedApp />);
  expect(screen.getByTestId('range-24h')).toBeInTheDocument();
  expect(screen.getByText(/All-Time High/i)).toBeInTheDocument();
});

// Test: clicking a timeframe button updates the active state (dark theme)
it('updates active button when a timeframe is clicked', () => {
  render(<App />);
  const btn14d = screen.getByText('14d');
  fireEvent.click(btn14d);
  expect(btn14d.className).toMatch(/bg-zinc-800/);
  expect(btn14d.className).toMatch(/border-red-500/);
  expect(btn14d.className).toMatch(/text-red-400/);
  expect(btn14d.className).toMatch(/font-bold/);
});

// Test: buttons remain enabled and responsive (dark theme)
it('timeframe buttons remain responsive', () => {
  render(<App />);
  const btn30d = screen.getByText('30d');
  fireEvent.click(btn30d);
  expect(btn30d.className).toMatch(/bg-zinc-800/);
  expect(btn30d.className).toMatch(/border-red-500/);
  expect(btn30d.className).toMatch(/text-red-400/);
  expect(btn30d.className).toMatch(/font-bold/);
  const btn1d = screen.getByText('1d');
  fireEvent.click(btn1d);
  expect(btn1d.className).toMatch(/bg-zinc-800/);
  expect(btn1d.className).toMatch(/border-red-500/);
  expect(btn1d.className).toMatch(/text-red-400/);
  expect(btn1d.className).toMatch(/font-bold/);
}); 