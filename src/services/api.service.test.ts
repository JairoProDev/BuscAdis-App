import axios from 'axios';
import { ApiService } from './api.service';
import { Logger } from './logging.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the Logger service
jest.mock('./logging.service', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset axios instance
    mockedAxios.create.mockReturnValue(mockedAxios);
    // Clear localStorage
    localStorage.clear();
  });

  describe('initialization', () => {
    it('creates axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('adds authorization header when token exists', () => {
      const token = 'test-token';
      localStorage.setItem('token', token);
      
      // Trigger interceptor
      const requestConfig = {};
      const requestInterceptor = ApiService.axiosInstance.interceptors.request.use.mock.calls[0][0];
      const result = requestInterceptor(requestConfig);
      
      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });
  });

  describe('get', () => {
    it('makes successful GET request', async () => {
      const mockResponse = { data: { test: true } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.get('/test');

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('/test');
      expect(Logger.info).toHaveBeenCalledWith(
        'GET request successful',
        expect.objectContaining({
          details: {
            url: '/test',
            response: mockResponse,
          },
        })
      );
    });

    it('handles GET request error', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(ApiService.get('/test')).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'GET request failed',
        expect.objectContaining({
          details: {
            url: '/test',
            error,
          },
        })
      );
    });
  });

  describe('post', () => {
    it('makes successful POST request', async () => {
      const mockData = { test: true };
      const mockResponse = { data: { success: true } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.post('/test', mockData);

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith('/test', mockData);
      expect(Logger.info).toHaveBeenCalledWith(
        'POST request successful',
        expect.objectContaining({
          details: {
            url: '/test',
            data: mockData,
            response: mockResponse,
          },
        })
      );
    });

    it('handles POST request error', async () => {
      const mockData = { test: true };
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(ApiService.post('/test', mockData)).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'POST request failed',
        expect.objectContaining({
          details: {
            url: '/test',
            data: mockData,
            error,
          },
        })
      );
    });
  });

  describe('put', () => {
    it('makes successful PUT request', async () => {
      const mockData = { test: true };
      const mockResponse = { data: { success: true } };
      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.put('/test', mockData);

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.put).toHaveBeenCalledWith('/test', mockData);
      expect(Logger.info).toHaveBeenCalledWith(
        'PUT request successful',
        expect.objectContaining({
          details: {
            url: '/test',
            data: mockData,
            response: mockResponse,
          },
        })
      );
    });

    it('handles PUT request error', async () => {
      const mockData = { test: true };
      const error = new Error('Network error');
      mockedAxios.put.mockRejectedValueOnce(error);

      await expect(ApiService.put('/test', mockData)).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'PUT request failed',
        expect.objectContaining({
          details: {
            url: '/test',
            data: mockData,
            error,
          },
        })
      );
    });
  });

  describe('delete', () => {
    it('makes successful DELETE request', async () => {
      const mockResponse = { data: { success: true } };
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.delete('/test');

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.delete).toHaveBeenCalledWith('/test');
      expect(Logger.info).toHaveBeenCalledWith(
        'DELETE request successful',
        expect.objectContaining({
          details: {
            url: '/test',
            response: mockResponse,
          },
        })
      );
    });

    it('handles DELETE request error', async () => {
      const error = new Error('Network error');
      mockedAxios.delete.mockRejectedValueOnce(error);

      await expect(ApiService.delete('/test')).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'DELETE request failed',
        expect.objectContaining({
          details: {
            url: '/test',
            error,
          },
        })
      );
    });
  });

  describe('error handling', () => {
    it('handles network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValueOnce(networkError);

      await expect(ApiService.get('/test')).rejects.toThrow('Network Error');
      expect(Logger.error).toHaveBeenCalledWith(
        'GET request failed',
        expect.objectContaining({
          details: {
            url: '/test',
            error: networkError,
          },
        })
      );
    });

    it('handles API errors with error response', async () => {
      const apiError = {
        response: {
          data: {
            message: 'Invalid request',
            errors: ['Field is required'],
          },
          status: 400,
        },
      };
      mockedAxios.post.mockRejectedValueOnce(apiError);

      await expect(ApiService.post('/test', {})).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'POST request failed',
        expect.objectContaining({
          details: {
            url: '/test',
            error: apiError,
            status: 400,
            message: 'Invalid request',
          },
        })
      );
    });

    it('handles unauthorized errors', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized',
          },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(unauthorizedError);

      await expect(ApiService.get('/test')).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'GET request failed',
        expect.objectContaining({
          details: {
            url: '/test',
            error: unauthorizedError,
            status: 401,
            message: 'Unauthorized',
          },
        })
      );
      // Should clear token on unauthorized
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
}); 