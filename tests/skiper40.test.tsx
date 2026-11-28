import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Link000,
  Link001,
  Link002,
  Link003,
  Link004,
  Link005,
  Skiper40,
} from '../src/components/ui/skiper-ui/skiper40';

describe('Skiper 40 Animated Links (Vite + CSS port)', () => {
  it('renders all six link variants with expected href, classes, and safe target rel', () => {
    render(
      <div>
        <Link000 href="/tasks" className="custom-0">Tasks</Link000>
        <Link001 href="https://example.com">External Docs</Link001>
        <Link002 href="/goals">Goals</Link002>
        <Link003 href="/habits">Habits</Link003>
        <Link004 href="/finance">Finance</Link004>
        <Link005 href="/career">Career</Link005>
      </div>
    );

    const l0 = screen.getByRole('link', { name: 'Tasks' });
    expect(l0).toHaveAttribute('href', '/tasks');
    expect(l0).toHaveClass('skiper40-link', 'skiper40-link000', 'custom-0');
    expect(l0.querySelector('svg')).toBeNull();

    const l1 = screen.getByRole('link', { name: 'External Docs' });
    expect(l1).toHaveAttribute('target', '_blank');
    expect(l1).toHaveAttribute('rel', 'noopener noreferrer');
    expect(l1).toHaveClass('skiper40-link001');
    expect(l1.querySelector('svg')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Goals' })).toHaveClass('skiper40-link002');
    expect(screen.getByRole('link', { name: 'Habits' })).toHaveClass('skiper40-link003');
    expect(screen.getByRole('link', { name: 'Finance' })).toHaveClass('skiper40-link004');
    expect(screen.getByRole('link', { name: 'Career' })).toHaveClass('skiper40-link005');
  });

  it('renders the Skiper40 showcase block cleanly', () => {
    render(<Skiper40 />);
    expect(screen.getAllByRole('link', { name: 'hi@skiper-ui.com' })).toHaveLength(5);
  });
});
