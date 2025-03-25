import React from 'react';
import { render, screen } from '@testing-library/react';
import ResponseDisplay from '../ResponseDisplay';

describe('ResponseDisplay', () => {
  it('renders nothing when no response is provided', () => {
    const { container } = render(<ResponseDisplay response="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders response text correctly', () => {
    const responseText = 'Test response';
    render(<ResponseDisplay response={responseText} />);
    expect(screen.getByText('Response')).toBeInTheDocument();
    expect(screen.getByText(responseText)).toBeInTheDocument();
  });

  it('renders multiple paragraphs correctly', () => {
    const multiLineResponse = 'First paragraph\nSecond paragraph';
    render(<ResponseDisplay response={multiLineResponse} />);
    
    const paragraphs = screen.getAllByText(/paragraph/);
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent('First paragraph');
    expect(paragraphs[1]).toHaveTextContent('Second paragraph');
  });
}); 