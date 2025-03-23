import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PublicationProvider, usePublication } from './PublicationContext';
import { Logger } from '@/services/logging.service';

// Mock the Logger service
jest.mock('@/services/logging.service', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Test component that uses the publication context
const TestComponent = () => {
  const { state, dispatch } = usePublication();
  
  return (
    <div>
      <div data-testid="current-step">{state.currentStep}</div>
      <div data-testid="category">{state.category}</div>
      <button
        onClick={() => dispatch({ type: 'SET_CATEGORY', payload: 'test-category' })}
        data-testid="set-category"
      >
        Set Category
      </button>
      <button
        onClick={() => dispatch({ type: 'NEXT_STEP' })}
        data-testid="next-step"
      >
        Next Step
      </button>
      <button
        onClick={() => dispatch({ type: 'PREV_STEP' })}
        data-testid="prev-step"
      >
        Previous Step
      </button>
      <button
        onClick={() => dispatch({
          type: 'UPDATE_FORM',
          payload: { title: 'Test Title' },
        })}
        data-testid="update-form"
      >
        Update Form
      </button>
    </div>
  );
};

describe('PublicationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTestComponent = () => {
    return render(
      <PublicationProvider>
        <TestComponent />
      </PublicationProvider>
    );
  };

  it('provides initial state', () => {
    renderTestComponent();
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    expect(screen.getByTestId('category')).toHaveTextContent('');
  });

  it('updates category', () => {
    renderTestComponent();
    fireEvent.click(screen.getByTestId('set-category'));
    expect(screen.getByTestId('category')).toHaveTextContent('test-category');
    expect(Logger.info).toHaveBeenCalledWith(
      'Category selected',
      expect.objectContaining({
        details: { category: 'test-category' },
      })
    );
  });

  it('navigates to next step', () => {
    renderTestComponent();
    fireEvent.click(screen.getByTestId('next-step'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('1');
    expect(Logger.info).toHaveBeenCalledWith(
      'Navigated to next step',
      expect.objectContaining({
        details: { step: 1 },
      })
    );
  });

  it('navigates to previous step', () => {
    renderTestComponent();
    // First go to step 1
    fireEvent.click(screen.getByTestId('next-step'));
    // Then go back to step 0
    fireEvent.click(screen.getByTestId('prev-step'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    expect(Logger.info).toHaveBeenCalledWith(
      'Navigated to previous step',
      expect.objectContaining({
        details: { step: 0 },
      })
    );
  });

  it('updates form data', () => {
    renderTestComponent();
    fireEvent.click(screen.getByTestId('update-form'));
    expect(Logger.info).toHaveBeenCalledWith(
      'Form data updated',
      expect.objectContaining({
        details: { formData: { title: 'Test Title' } },
      })
    );
  });

  it('prevents navigation to previous step at step 0', () => {
    renderTestComponent();
    fireEvent.click(screen.getByTestId('prev-step'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    expect(Logger.error).toHaveBeenCalledWith(
      'Cannot navigate to previous step',
      expect.objectContaining({
        details: { currentStep: 0 },
      })
    );
  });

  it('prevents navigation to next step at final step', () => {
    renderTestComponent();
    // Navigate to last step
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByTestId('next-step'));
    }
    const finalStep = screen.getByTestId('current-step').textContent;
    fireEvent.click(screen.getByTestId('next-step'));
    expect(screen.getByTestId('current-step')).toHaveTextContent(finalStep);
    expect(Logger.error).toHaveBeenCalledWith(
      'Cannot navigate to next step',
      expect.objectContaining({
        details: { currentStep: Number(finalStep) },
      })
    );
  });

  it('validates form data before navigation', () => {
    renderTestComponent();
    // Set category (required for step 0)
    fireEvent.click(screen.getByTestId('set-category'));
    // Try to navigate to next step
    fireEvent.click(screen.getByTestId('next-step'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('1');
  });

  it('prevents navigation when form data is invalid', () => {
    renderTestComponent();
    // Try to navigate without setting category
    fireEvent.click(screen.getByTestId('next-step'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    expect(Logger.error).toHaveBeenCalledWith(
      'Cannot navigate: invalid form data',
      expect.objectContaining({
        details: { step: 0 },
      })
    );
  });

  it('handles multiple form updates', () => {
    renderTestComponent();
    act(() => {
      // Update form multiple times
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByTestId('update-form'));
      }
    });
    expect(Logger.info).toHaveBeenCalledTimes(3);
  });

  it('maintains state between steps', () => {
    renderTestComponent();
    // Set category
    fireEvent.click(screen.getByTestId('set-category'));
    // Navigate to next step
    fireEvent.click(screen.getByTestId('next-step'));
    // Category should persist
    expect(screen.getByTestId('category')).toHaveTextContent('test-category');
  });
}); 