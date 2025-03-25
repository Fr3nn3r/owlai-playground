import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

// Mock the config module with default export
vi.mock('./config', () => {
  console.log('🔧 Mocking config module');
  return {
    default: {
      API_URL: 'http://test-api'
    }
  }
});

// Mock the fetch function
global.fetch = vi.fn();

const mockAgents = [
  {
    id: 'agent1',
    name: 'Test Agent 1',
    description: 'Test Description 1',
    welcome_title: 'Welcome Test 1',
    owl_image_url: 'https://example.com/owl1.jpg',
    color_theme: {
      primary: '#000000',
      secondary: '#111111'
    },
    default_queries: [
      'What is test query 1?',
      'What is test query 2?'
    ]
  },
  {
    id: 'agent2',
    name: 'Test Agent 2',
    description: 'Test Description 2',
    welcome_title: 'Welcome Test 2',
    owl_image_url: 'https://example.com/owl2.jpg',
    color_theme: {
      primary: '#222222',
      secondary: '#333333'
    },
    default_queries: [
      'What is test query 3?',
      'What is test query 4?'
    ]
  }
];

const mockDefaultQueries = [
  'What is test query 1?',
  'What is test query 2?'
];

describe('App', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    console.log('🧹 Resetting fetch mock');
    global.fetch.mockReset();
  });

  it('renders loading state initially', () => {
    console.log('🧪 Testing loading state');
    global.fetch.mockImplementation(() => {
      console.log('⏳ Returning never-resolving promise to maintain loading state');
      return new Promise(() => {});
    });

    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loads and displays agents successfully', async () => {
    // Mock both the agents fetch and default queries fetch
    global.fetch.mockImplementation((url) => {
      console.log('🌐 Mocked fetch called with URL:', url);
      
      if (url.includes('/agents') && !url.includes('/default-queries')) {
        console.log('✅ Handling /agents request');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockAgents)
        });
      } else if (url.includes('/default-queries')) {
        console.log('✅ Handling /default-queries request');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockDefaultQueries)
        });
      }
      console.error('❌ Unhandled request:', url);
      return Promise.reject(new Error(`Unhandled request to ${url}`));
    });

    render(<App />);

    // First agent should be selected by default
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Welcome Test 1' })).toBeInTheDocument();
    }, { timeout: 5000 });

    // Agent selector should show both agents
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();

    // Default queries should be loaded
    await waitFor(() => {
      expect(screen.getByText('What is test query 1?')).toBeInTheDocument();
      expect(screen.getByText('What is test query 2?')).toBeInTheDocument();
    });
  });

  it('handles agent loading error', async () => {
    global.fetch.mockImplementation(() => Promise.reject(new Error('Failed to fetch')));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/could not load agents/i)).toBeInTheDocument();
    });
  });

  it('submits question and displays response', async () => {
    // Mock all necessary endpoints
    global.fetch.mockImplementation((url) => {
      console.log('🌐 Mocked fetch called with URL:', url);
      
      if (url.includes('/agents') && !url.includes('/default-queries')) {
        console.log('✅ Handling /agents request');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockAgents)
        });
      } else if (url.includes('/default-queries')) {
        console.log('✅ Handling /default-queries request');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockDefaultQueries)
        });
      } else if (url.includes('/query')) {
        console.log('✅ Handling /query request');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ answer: 'Test answer' })
        });
      }
      console.error('❌ Unhandled request:', url);
      return Promise.reject(new Error(`Unhandled request to ${url}`));
    });

    render(<App />);

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Welcome Test 1' })).toBeInTheDocument();
    });

    // Type a question
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test question' } });

    // Submit the question
    const submitButton = screen.getByRole('button', { name: /ask question/i });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByText('Thinking...')).toBeInTheDocument();

    // Wait for the response
    await waitFor(() => {
      expect(screen.getByText('Test answer')).toBeInTheDocument();
    });
  });

  it('handles query submission error', async () => {
    // Mock successful agents fetch but failed query
    global.fetch.mockImplementation((url) => {
      console.log('🌐 Mocked fetch called with URL:', url);
      
      if (url.includes('/agents') && !url.includes('/default-queries')) {
        console.log('✅ Handling /agents request');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockAgents)
        });
      } else if (url.includes('/default-queries')) {
        console.log('✅ Handling /default-queries request');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockDefaultQueries)
        });
      } else if (url.includes('/query')) {
        console.log('❌ Simulating query error');
        return Promise.reject(new Error('Failed to fetch'));
      }
      console.error('❌ Unhandled request:', url);
      return Promise.reject(new Error(`Unhandled request to ${url}`));
    });

    render(<App />);

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Welcome Test 1' })).toBeInTheDocument();
    });

    // Type a question
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test question' } });

    // Submit the question
    const submitButton = screen.getByRole('button', { name: /ask question/i });
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/could not fetch agent response/i)).toBeInTheDocument();
    });
  });
}); 