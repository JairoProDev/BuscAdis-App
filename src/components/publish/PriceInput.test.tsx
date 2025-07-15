import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriceInput } from './PriceInput';
import { PublicationProvider } from '@/contexts/PublicationContext';
import { Logger } from '@/services/logging.service';

// Mock the Logger service
jest.mock('@/services/logging.service', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('PriceInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <PublicationProvider>
        <PriceInput />
      </PublicationProvider>
    );
  };

  it('renders price input and currency selector', () => {
    renderComponent();
    expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/moneda/i)).toBeInTheDocument();
  });

  it('formats price input correctly', () => {
    renderComponent();
    const input = screen.getByLabelText(/precio/i);
    
    fireEvent.change(input, { target: { value: '1234.56' } });
    expect(input).toHaveValue('1.234,56');
    
    fireEvent.change(input, { target: { value: '1000000' } });
    expect(input).toHaveValue('1.000.000');
  });

  it('handles invalid price inputs', () => {
    renderComponent();
    const input = screen.getByLabelText(/precio/i);
    
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(Logger.error).toHaveBeenCalledWith(
      'Invalid price input',
      expect.objectContaining({
        details: expect.any(String),
      })
    );
  });

  it('updates currency selection', () => {
    renderComponent();
    const select = screen.getByLabelText(/moneda/i);
    
    fireEvent.change(select, { target: { value: 'USD' } });
    expect(Logger.info).toHaveBeenCalledWith(
      'Currency updated',
      expect.objectContaining({
        details: { currency: 'USD' },
      })
    );
  });

  it('displays currency symbol correctly', () => {
    renderComponent();
    const select = screen.getByLabelText(/moneda/i);
    
    // Test EUR symbol
    expect(screen.getByText('€')).toBeInTheDocument();
    
    // Test USD symbol
    fireEvent.change(select, { target: { value: 'USD' } });
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('handles decimal separator correctly', () => {
    renderComponent();
    const input = screen.getByLabelText(/precio/i);
    
    fireEvent.change(input, { target: { value: '1234.56' } });
    expect(input).toHaveValue('1.234,56');
    
    fireEvent.change(input, { target: { value: '1234,56' } });
    expect(input).toHaveValue('1.234,56');
  });

  it('prevents non-numeric input', () => {
    renderComponent();
    const input = screen.getByLabelText(/precio/i);
    
    fireEvent.change(input, { target: { value: '123abc456' } });
    expect(input).toHaveValue('123.456');
  });

  it('handles maximum price limit', () => {
    renderComponent();
    const input = screen.getByLabelText(/precio/i);
    
    fireEvent.change(input, { target: { value: '1000000000' } });
    expect(Logger.error).toHaveBeenCalledWith(
      'Price exceeds maximum limit',
      expect.objectContaining({
        details: expect.any(String),
      })
    );
  });

  it('maintains price format on blur', () => {
    renderComponent();
    const input = screen.getByLabelText(/precio/i);
    
    fireEvent.change(input, { target: { value: '1234.56' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('1.234,56');
  });
}); 