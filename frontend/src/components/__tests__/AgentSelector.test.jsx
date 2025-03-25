import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AgentSelector from '../AgentSelector';

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
    }
  },
  {
    id: 'agent2',
    name: 'Test Agent 2',
    description: 'Test Description 2',
    welcome_title: 'Welcome Test 2',
    owl_image_url: '', // Empty URL to test fallback
    color_theme: {
      primary: '#222222',
      secondary: '#333333'
    }
  }
];

describe('AgentSelector', () => {
  it('renders all agents', () => {
    render(
      <AgentSelector
        agents={mockAgents}
        selectedAgent={null}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Welcome Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
  });

  it('uses default owl image when agent image URL is empty', () => {
    render(
      <AgentSelector
        agents={mockAgents}
        selectedAgent={null}
        onSelect={() => {}}
      />
    );

    const images = screen.getAllByRole('img');
    expect(images[1].src).toContain('owl-default.jpg');
  });

  it('uses default owl image when agent image fails to load', () => {
    render(
      <AgentSelector
        agents={mockAgents}
        selectedAgent={null}
        onSelect={() => {}}
      />
    );

    const firstImage = screen.getAllByRole('img')[0];
    fireEvent.error(firstImage);

    expect(firstImage.src).toContain('owl-default.jpg');
    expect(screen.getByText('Using default')).toBeInTheDocument();
  });

  it('calls onSelect with correct agent when clicked', () => {
    const handleSelect = vi.fn();
    render(
      <AgentSelector
        agents={mockAgents}
        selectedAgent={null}
        onSelect={handleSelect}
      />
    );

    const firstAgentCard = screen.getByText('Test Agent 1').closest('div[role="button"]');
    fireEvent.click(firstAgentCard);

    expect(handleSelect).toHaveBeenCalledWith(mockAgents[0]);
  });

  it('shows selected state for the selected agent', () => {
    render(
      <AgentSelector
        agents={mockAgents}
        selectedAgent={mockAgents[0]}
        onSelect={() => {}}
      />
    );

    const selectedCard = screen.getByText('Test Agent 1').closest('div[role="button"]');
    expect(selectedCard).toHaveClass('ring-2');
  });

  it('applies custom className when provided', () => {
    render(
      <AgentSelector
        agents={mockAgents}
        selectedAgent={null}
        onSelect={() => {}}
        className="custom-class"
      />
    );

    const container = screen.getByRole('list');
    expect(container).toHaveClass('custom-class');
  });
}); 