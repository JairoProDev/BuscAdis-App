import { ImageService } from './image.service';
import { Logger } from './logging.service';
import { ApiService } from './api.service';

// Mock the Logger service
jest.mock('./logging.service', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock the API service
jest.mock('./api.service', () => ({
  ApiService: {
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ImageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any mocked canvas or image data
    if (global.URL.createObjectURL) {
      URL.createObjectURL = jest.fn();
      URL.revokeObjectURL = jest.fn();
    }
  });

  const createMockFile = (
    name = 'test.jpg',
    type = 'image/jpeg',
    size = 1024 * 1024
  ) => {
    const file = new File(['test'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  describe('optimizeImage', () => {
    it('optimizes image successfully', async () => {
      const file = createMockFile();
      const mockCanvas = {
        toBlob: jest.fn((callback) =>
          callback(new Blob(['optimized'], { type: 'image/jpeg' }))
        ),
        width: 800,
        height: 600,
      };
      const mockContext = {
        drawImage: jest.fn(),
      };
      document.createElement = jest.fn().mockReturnValue(mockCanvas);
      mockCanvas.getContext = jest.fn().mockReturnValue(mockContext);

      const result = await ImageService.optimizeImage(file);

      expect(result).toHaveProperty('optimizedBlob');
      expect(result).toHaveProperty('width', 800);
      expect(result).toHaveProperty('height', 600);
      expect(Logger.info).toHaveBeenCalledWith(
        'Image optimized successfully',
        expect.objectContaining({
          details: {
            fileName: file.name,
            originalSize: file.size,
            optimizedSize: expect.any(Number),
          },
        })
      );
    });

    it('handles optimization error', async () => {
      const file = createMockFile();
      document.createElement = jest.fn().mockImplementation(() => {
        throw new Error('Canvas creation failed');
      });

      await expect(ImageService.optimizeImage(file)).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Image optimization failed',
        expect.objectContaining({
          details: expect.any(Error),
        })
      );
    });

    it('validates image dimensions', async () => {
      const file = createMockFile();
      const mockCanvas = {
        toBlob: jest.fn((callback) =>
          callback(new Blob(['optimized'], { type: 'image/jpeg' }))
        ),
        width: 10000, // Too large
        height: 10000,
      };
      const mockContext = {
        drawImage: jest.fn(),
      };
      document.createElement = jest.fn().mockReturnValue(mockCanvas);
      mockCanvas.getContext = jest.fn().mockReturnValue(mockContext);

      await expect(ImageService.optimizeImage(file)).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Image dimensions exceed maximum allowed',
        expect.objectContaining({
          details: {
            fileName: file.name,
            width: mockCanvas.width,
            height: mockCanvas.height,
          },
        })
      );
    });
  });

  describe('uploadImage', () => {
    it('uploads image successfully', async () => {
      const file = createMockFile();
      const mockUrl = 'https://example.com/image.jpg';
      ApiService.post.mockResolvedValueOnce({ data: { url: mockUrl } });

      const result = await ImageService.uploadImage(file);

      expect(result).toBe(mockUrl);
      expect(ApiService.post).toHaveBeenCalledWith(
        '/images/upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(Logger.success).toHaveBeenCalledWith(
        'Image uploaded successfully',
        expect.objectContaining({
          details: {
            fileName: file.name,
            url: mockUrl,
          },
        })
      );
    });

    it('handles upload error', async () => {
      const file = createMockFile();
      const error = new Error('Upload failed');
      ApiService.post.mockRejectedValueOnce(error);

      await expect(ImageService.uploadImage(file)).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Image upload failed',
        expect.objectContaining({
          details: {
            fileName: file.name,
            error,
          },
        })
      );
    });
  });

  describe('deleteImage', () => {
    it('deletes image successfully', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      ApiService.delete.mockResolvedValueOnce({ data: { success: true } });

      await ImageService.deleteImage(imageUrl);

      expect(ApiService.delete).toHaveBeenCalledWith(
        `/images/delete?url=${encodeURIComponent(imageUrl)}`
      );
      expect(Logger.success).toHaveBeenCalledWith(
        'Image deleted successfully',
        expect.objectContaining({
          details: { url: imageUrl },
        })
      );
    });

    it('handles delete error', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const error = new Error('Delete failed');
      ApiService.delete.mockRejectedValueOnce(error);

      await expect(ImageService.deleteImage(imageUrl)).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Image deletion failed',
        expect.objectContaining({
          details: {
            url: imageUrl,
            error,
          },
        })
      );
    });
  });

  describe('validateImage', () => {
    it('validates image file successfully', () => {
      const file = createMockFile();
      expect(() => ImageService.validateImage(file)).not.toThrow();
    });

    it('rejects invalid file type', () => {
      const file = createMockFile('test.txt', 'text/plain');
      expect(() => ImageService.validateImage(file)).toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Invalid image type',
        expect.objectContaining({
          details: {
            fileName: file.name,
            fileType: file.type,
          },
        })
      );
    });

    it('rejects file exceeding size limit', () => {
      const file = createMockFile('large.jpg', 'image/jpeg', 11 * 1024 * 1024); // 11MB
      expect(() => ImageService.validateImage(file)).toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Image size exceeds maximum allowed',
        expect.objectContaining({
          details: {
            fileName: file.name,
            fileSize: file.size,
          },
        })
      );
    });
  });
}); 