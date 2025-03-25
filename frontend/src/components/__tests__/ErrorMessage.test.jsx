import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  const mockMessage = 'Test error message';
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  it('renders error message correctly', () => {
    render(<ErrorMessage message={mockMessage} />);
    expect(screen.getByText(mockMessage)).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    render(<ErrorMessage message={mockMessage} onRetry={mockOnRetry} />);
    const retryButton = screen.getByText('Try again');
    expect(retryButton).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message={mockMessage} />);
    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(<ErrorMessage message={mockMessage} onRetry={mockOnRetry} />);
    const retryButton = screen.getByText('Try again');
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
}); 