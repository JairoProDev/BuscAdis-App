import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationSelector } from './LocationSelector';
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

describe('LocationSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <PublicationProvider>
        <LocationSelector />
      </PublicationProvider>
    );
  };

  it('renders the location input field', () => {
    renderComponent();
    expect(screen.getByLabelText(/ubicación/i)).toBeInTheDocument();
  });

  it('initializes Google Maps with default location', async () => {
    renderComponent();
    await waitFor(() => {
      expect(window.google.maps.Map).toHaveBeenCalled();
    });
  });

  it('updates location when marker is moved', async () => {
    renderComponent();
    
    const mockLatLng = { lat: 40.416775, lng: -3.703790 };
    const mockEvent = {
      latLng: {
        lat: () => mockLatLng.lat,
        lng: () => mockLatLng.lng,
      },
    };

    await waitFor(() => {
      const marker = window.google.maps.Marker.mock.instances[0];
      marker.listeners?.dragend?.(mockEvent);
    });

    expect(Logger.info).toHaveBeenCalledWith(
      'Location updated',
      expect.objectContaining({
        details: expect.objectContaining({
          latitude: mockLatLng.lat,
          longitude: mockLatLng.lng,
        }),
      })
    );
  });

  it('handles geocoding errors gracefully', async () => {
    const mockGeocodeError = new Error('Geocoding failed');
    window.google.maps.Geocoder.mockImplementationOnce(() => ({
      geocode: jest.fn().mockRejectedValue(mockGeocodeError),
    }));

    renderComponent();

    await waitFor(() => {
      expect(Logger.error).toHaveBeenCalledWith(
        'Error al obtener la dirección',
        expect.objectContaining({
          details: mockGeocodeError,
        })
      );
    });
  });

  it('updates map when location is entered manually', async () => {
    renderComponent();
    const input = screen.getByLabelText(/ubicación/i);
    
    fireEvent.change(input, { target: { value: 'Madrid, Spain' } });

    await waitFor(() => {
      expect(window.google.maps.Geocoder).toHaveBeenCalled();
    });
  });

  it('centers map on user location when geolocation is available', async () => {
    const mockPosition = {
      coords: {
        latitude: 40.416775,
        longitude: -3.703790,
      },
    };

    const mockGeolocation = {
      getCurrentPosition: jest.fn()
        .mockImplementationOnce((success) => success(mockPosition)),
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
    });

    renderComponent();

    await waitFor(() => {
      expect(window.google.maps.Map.mock.instances[0].setCenter).toHaveBeenCalled();
    });
  });

  it('handles geolocation errors gracefully', async () => {
    const mockGeolocationError = new Error('Geolocation failed');
    const mockGeolocation = {
      getCurrentPosition: jest.fn()
        .mockImplementationOnce((success, error) => error(mockGeolocationError)),
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
    });

    renderComponent();

    await waitFor(() => {
      expect(Logger.error).toHaveBeenCalledWith(
        'Error al obtener la ubicación del usuario',
        expect.objectContaining({
          details: mockGeolocationError,
        })
      );
    });
  });
}); 