import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_URL: 'http://test-api'
}));

// Mock the fetch function
global.fetch = vi.fn();

describe('App', () => {
  const mockAgents = [
    { id: '1', name: 'Agent 1' },
    { id: '2', name: 'Agent 2' }
  ];

  const mockResponse = { answer: 'Test answer' };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    // Mock fetch to return a rejected promise by default
    global.fetch.mockImplementation(() =>
      Promise.reject(new Error('Failed to fetch'))
    );
  });

  it('renders loading state initially', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgents)
      })
    );

    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loads and displays agents successfully', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgents)
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Agent 1')).toBeInTheDocument();
      expect(screen.getByText('Agent 2')).toBeInTheDocument();
    });
  });

  it('handles agent loading error', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Could not load agents/)).toBeInTheDocument();
    });
  });

  it('submits question and displays response', async () => {
    // Mock successful agent loading
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgents)
      })
    );

    // Mock successful query response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    render(<App />);

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Agent 1')).toBeInTheDocument();
    });

    // Fill in question
    const questionInput = screen.getByPlaceholderText(/question/i);
    fireEvent.change(questionInput, { target: { value: 'Test question' } });

    // Submit question
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('Test answer')).toBeInTheDocument();
    });
  });

  it('handles query submission error', async () => {
    // Mock successful agent loading
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgents)
      })
    );

    // Mock failed query response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Query failed' })
      })
    );

    render(<App />);

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Agent 1')).toBeInTheDocument();
    });

    // Fill in question
    const questionInput = screen.getByPlaceholderText(/question/i);
    fireEvent.change(questionInput, { target: { value: 'Test question' } });

    // Submit question
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Could not fetch agent response/)).toBeInTheDocument();
    });
  });
}); 