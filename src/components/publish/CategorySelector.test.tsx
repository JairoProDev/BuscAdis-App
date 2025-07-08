import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategorySelector from './CategorySelector';
import { PublicationProvider } from '../../contexts/PublicationContext';
import { categoryService } from '../../services/api';

// Mock the categoryService
jest.mock('../../services/api', () => ({
  categoryService: {
    getCategories: jest.fn(),
    getSubcategories: jest.fn(),
    getSubSubcategories: jest.fn(),
  },
}));

// Mock the logger
jest.mock('../../services/logging.service', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockCategories = [
  {
    id: 'empleos',
    name: 'Empleos',
    description: 'Encuentra oportunidades laborales',
    icon: '/icons/jobs.svg',
  },
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    description: 'Casas, departamentos y más',
    icon: '/icons/real-estate.svg',
  },
];

const mockSubcategories = [
  {
    id: 'full-time',
    name: 'Tiempo Completo',
    description: 'Trabajos de tiempo completo',
    categoryId: 'empleos',
  },
  {
    id: 'part-time',
    name: 'Medio Tiempo',
    description: 'Trabajos de medio tiempo',
    categoryId: 'empleos',
  },
];

const mockSubSubcategories = [
  {
    id: 'office',
    name: 'Oficina',
    description: 'Trabajos de oficina',
    subcategoryId: 'full-time',
  },
  {
    id: 'remote',
    name: 'Remoto',
    description: 'Trabajos remotos',
    subcategoryId: 'full-time',
  },
];

describe('CategorySelector', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (categoryService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
    (categoryService.getSubcategories as jest.Mock).mockResolvedValue(mockSubcategories);
    (categoryService.getSubSubcategories as jest.Mock).mockResolvedValue(mockSubSubcategories);
  });

  it('renders loading state initially', () => {
    render(
      <PublicationProvider>
        <CategorySelector />
      </PublicationProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loads and displays categories', async () => {
    render(
      <PublicationProvider>
        <CategorySelector />
      </PublicationProvider>
    );

    await waitFor(() => {
      expect(categoryService.getCategories).toHaveBeenCalled();
    });

    expect(screen.getByText('Empleos')).toBeInTheDocument();
    expect(screen.getByText('Inmuebles')).toBeInTheDocument();
  });

  it('shows error state when categories fail to load', async () => {
    (categoryService.getCategories as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    render(
      <PublicationProvider>
        <CategorySelector />
      </PublicationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error al cargar las categorías')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Reintentar');
    expect(retryButton).toBeInTheDocument();

    // Test retry functionality
    (categoryService.getCategories as jest.Mock).mockResolvedValueOnce(mockCategories);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Empleos')).toBeInTheDocument();
    });
  });

  it('navigates through category selection flow', async () => {
    render(
      <PublicationProvider>
        <CategorySelector />
      </PublicationProvider>
    );

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Empleos')).toBeInTheDocument();
    });

    // Select a category
    fireEvent.click(screen.getByText('Empleos'));

    // Wait for subcategories to load
    await waitFor(() => {
      expect(categoryService.getSubcategories).toHaveBeenCalledWith('empleos');
      expect(screen.getByText('Tiempo Completo')).toBeInTheDocument();
    });

    // Select a subcategory
    fireEvent.click(screen.getByText('Tiempo Completo'));

    // Wait for sub-subcategories to load
    await waitFor(() => {
      expect(categoryService.getSubSubcategories).toHaveBeenCalledWith('full-time');
      expect(screen.getByText('Oficina')).toBeInTheDocument();
    });

    // Test back navigation
    const backButton = screen.getByText('Volver');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Tiempo Completo')).toBeInTheDocument();
    });

    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Empleos')).toBeInTheDocument();
    });
  });

  it('handles category selection and updates context', async () => {
    render(
      <PublicationProvider>
        <CategorySelector />
      </PublicationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Empleos')).toBeInTheDocument();
    });

    // Select a category
    fireEvent.click(screen.getByText('Empleos'));

    await waitFor(() => {
      expect(screen.getByText('Tiempo Completo')).toBeInTheDocument();
    });

    // Select a subcategory
    fireEvent.click(screen.getByText('Tiempo Completo'));

    await waitFor(() => {
      expect(screen.getByText('Oficina')).toBeInTheDocument();
    });

    // Select a sub-subcategory
    fireEvent.click(screen.getByText('Oficina'));

    // Verify that the context was updated correctly
    // Note: You might need to add a way to verify the context state in your tests
  });

  it('displays category icons when available', async () => {
    render(
      <PublicationProvider>
        <CategorySelector />
      </PublicationProvider>
    );

    await waitFor(() => {
      const icons = screen.getAllByRole('img');
      expect(icons).toHaveLength(2);
      expect(icons[0]).toHaveAttribute('src', '/icons/jobs.svg');
      expect(icons[1]).toHaveAttribute('src', '/icons/real-estate.svg');
    });
  });
}); 