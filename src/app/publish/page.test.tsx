import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PublishPage from './page';
import { PublicationProvider } from '../../contexts/PublicationContext';
import { Logger } from '../../services/logging.service';

// Mock the logger
jest.mock('../../services/logging.service', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock child components
jest.mock('../../components/publish/CategorySelector', () => {
  return function MockCategorySelector() {
    return <div data-testid="category-selector">Category Selector</div>;
  };
});

jest.mock('../../components/publish/LocationSelector', () => {
  return function MockLocationSelector() {
    return <div data-testid="location-selector">Location Selector</div>;
  };
});

jest.mock('../../components/publish/PriceInput', () => {
  return function MockPriceInput() {
    return <div data-testid="price-input">Price Input</div>;
  };
});

jest.mock('../../components/publish/ImageUploader', () => {
  return function MockImageUploader() {
    return <div data-testid="image-uploader">Image Uploader</div>;
  };
});

jest.mock('../../components/publish/PublishAchievements', () => {
  return function MockPublishAchievements() {
    return <div data-testid="publish-achievements">Publish Achievements</div>;
  };
});

describe('PublishPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the initial step with category selector', () => {
    render(
      <PublicationProvider>
        <PublishPage />
      </PublicationProvider>
    );

    expect(screen.getByText('Publicar Anuncio')).toBeInTheDocument();
    expect(screen.getByTestId('category-selector')).toBeInTheDocument();
    expect(screen.getByText('Categoría')).toBeInTheDocument();
  });

  it('shows all steps in the progress bar', () => {
    render(
      <PublicationProvider>
        <PublishPage />
      </PublicationProvider>
    );

    expect(screen.getByText('Categoría')).toBeInTheDocument();
    expect(screen.getByText('Detalles')).toBeInTheDocument();
    expect(screen.getByText('Ubicación')).toBeInTheDocument();
    expect(screen.getByText('Imágenes')).toBeInTheDocument();
    expect(screen.getByText('Revisar')).toBeInTheDocument();
  });

  it('navigates through steps when clicking next and back', async () => {
    render(
      <PublicationProvider>
        <PublishPage />
      </PublicationProvider>
    );

    // Initial step (Category)
    expect(screen.getByTestId('category-selector')).toBeInTheDocument();

    // Click next to go to Details step
    fireEvent.click(screen.getByText('Siguiente'));
    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toBeInTheDocument();
      expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
      expect(screen.getByTestId('price-input')).toBeInTheDocument();
    });

    // Click next to go to Location step
    fireEvent.click(screen.getByText('Siguiente'));
    await waitFor(() => {
      expect(screen.getByTestId('location-selector')).toBeInTheDocument();
    });

    // Click next to go to Images step
    fireEvent.click(screen.getByText('Siguiente'));
    await waitFor(() => {
      expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
    });

    // Click next to go to Review step
    fireEvent.click(screen.getByText('Siguiente'));
    await waitFor(() => {
      expect(screen.getByText('Resumen de tu publicación')).toBeInTheDocument();
      expect(screen.getByTestId('publish-achievements')).toBeInTheDocument();
    });

    // Click back to return to Images step
    fireEvent.click(screen.getByText('Anterior'));
    await waitFor(() => {
      expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
    });
  });

  it('logs step changes', () => {
    render(
      <PublicationProvider>
        <PublishPage />
      </PublicationProvider>
    );

    fireEvent.click(screen.getByText('Siguiente'));
    expect(Logger.info).toHaveBeenCalledWith('Avanzando al paso 2');

    fireEvent.click(screen.getByText('Anterior'));
    expect(Logger.info).toHaveBeenCalledWith('Retrocediendo al paso 1');
  });

  it('updates form data when filling details', async () => {
    render(
      <PublicationProvider>
        <PublishPage />
      </PublicationProvider>
    );

    // Go to Details step
    fireEvent.click(screen.getByText('Siguiente'));

    // Fill in the title
    const titleInput = screen.getByLabelText('Título');
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    // Fill in the description
    const descriptionInput = screen.getByLabelText('Descripción');
    fireEvent.change(descriptionInput, {
      target: { value: 'Test Description' },
    });

    // Verify the values are updated
    expect(titleInput).toHaveValue('Test Title');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  it('disables navigation buttons appropriately', () => {
    render(
      <PublicationProvider>
        <PublishPage />
      </PublicationProvider>
    );

    // On first step, back button should be disabled
    const backButton = screen.getByText('Anterior');
    expect(backButton).toBeDisabled();

    // Navigate to last step
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText('Siguiente'));
    }

    // On last step, next button should not be visible
    expect(screen.queryByText('Siguiente')).not.toBeInTheDocument();
  });

  it('shows publish button on final step', async () => {
    render(
      <PublicationProvider>
        <PublishPage />
      </PublicationProvider>
    );

    // Navigate to last step
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText('Siguiente'));
    }

    await waitFor(() => {
      expect(screen.getByText('Publicar anuncio')).toBeInTheDocument();
    });

    // Click publish button
    fireEvent.click(screen.getByText('Publicar anuncio'));
    expect(Logger.info).toHaveBeenCalledWith('Publicación enviada', expect.any(Object));
  });
}); 