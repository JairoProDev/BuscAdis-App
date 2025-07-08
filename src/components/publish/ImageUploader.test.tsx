import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploader } from './ImageUploader';
import { PublicationProvider } from '@/contexts/PublicationContext';
import { Logger } from '@/services/logging.service';
import { ImageService } from '@/services/image.service';

// Mock the Logger service
jest.mock('@/services/logging.service', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock the Image service
jest.mock('@/services/image.service', () => ({
  ImageService: {
    optimizeImage: jest.fn(),
    uploadImage: jest.fn(),
  },
}));

describe('ImageUploader', () => {
  const mockStore = {
    getState: () => ({}),
    dispatch: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful image optimization
    ImageService.optimizeImage.mockResolvedValue({
      optimizedBlob: new Blob(['test'], { type: 'image/jpeg' }),
      width: 800,
      height: 600,
    });
    // Mock successful image upload
    ImageService.uploadImage.mockResolvedValue('https://example.com/image.jpg');
  });

  const renderComponent = () => {
    return render(
      <PublicationProvider>
        <ImageUploader />
      </PublicationProvider>
    );
  };

  const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024 * 1024) => {
    const file = new File(['test'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  it('renders the image upload area', () => {
    renderComponent();
    expect(screen.getByText(/arrastra y suelta/i)).toBeInTheDocument();
    expect(screen.getByText(/o haz clic para seleccionar/i)).toBeInTheDocument();
  });

  it('handles file selection through input', async () => {
    renderComponent();
    const file = createMockFile();
    const input = screen.getByLabelText(/seleccionar imágenes/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(ImageService.optimizeImage).toHaveBeenCalledWith(file);
      expect(Logger.info).toHaveBeenCalledWith(
        'Image selected',
        expect.objectContaining({
          details: { fileName: file.name },
        })
      );
    });
  });

  it('handles drag and drop', async () => {
    renderComponent();
    const dropZone = screen.getByTestId('drop-zone');
    const file = createMockFile();
    
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });
    
    await waitFor(() => {
      expect(ImageService.optimizeImage).toHaveBeenCalledWith(file);
    });
  });

  it('validates file type', async () => {
    renderComponent();
    const file = createMockFile('test.txt', 'text/plain');
    const input = screen.getByLabelText(/seleccionar imágenes/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    expect(Logger.error).toHaveBeenCalledWith(
      'Invalid file type',
      expect.objectContaining({
        details: { fileName: file.name, fileType: file.type },
      })
    );
  });

  it('validates file size', async () => {
    renderComponent();
    const file = createMockFile('large.jpg', 'image/jpeg', 11 * 1024 * 1024); // 11MB
    const input = screen.getByLabelText(/seleccionar imágenes/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    expect(Logger.error).toHaveBeenCalledWith(
      'File too large',
      expect.objectContaining({
        details: { fileName: file.name, fileSize: file.size },
      })
    );
  });

  it('handles image optimization failure', async () => {
    const error = new Error('Optimization failed');
    ImageService.optimizeImage.mockRejectedValueOnce(error);
    
    renderComponent();
    const file = createMockFile();
    const input = screen.getByLabelText(/seleccionar imágenes/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(Logger.error).toHaveBeenCalledWith(
        'Image optimization failed',
        expect.objectContaining({
          details: error,
        })
      );
    });
  });

  it('handles image upload failure', async () => {
    const error = new Error('Upload failed');
    ImageService.uploadImage.mockRejectedValueOnce(error);
    
    renderComponent();
    const file = createMockFile();
    const input = screen.getByLabelText(/seleccionar imágenes/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(Logger.error).toHaveBeenCalledWith(
        'Image upload failed',
        expect.objectContaining({
          details: error,
        })
      );
    });
  });

  it('displays upload progress', async () => {
    renderComponent();
    const file = createMockFile();
    const input = screen.getByLabelText(/seleccionar imágenes/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText(/procesando/i)).toBeInTheDocument();
    });
  });

  it('allows image removal', async () => {
    renderComponent();
    const file = createMockFile();
    const input = screen.getByLabelText(/seleccionar imágenes/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      const removeButton = screen.getByLabelText(/eliminar imagen/i);
      fireEvent.click(removeButton);
      expect(Logger.info).toHaveBeenCalledWith(
        'Image removed',
        expect.objectContaining({
          details: { fileName: file.name },
        })
      );
    });
  });
}); 