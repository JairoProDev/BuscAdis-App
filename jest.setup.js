import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return "";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
const mockResizeObserver = jest.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.ResizeObserver = mockResizeObserver;

// Mock Google Maps
const mockGeocoder = {
  geocode: jest.fn(),
};

const mockMap = {
  setCenter: jest.fn(),
  setZoom: jest.fn(),
  fitBounds: jest.fn(),
};

const mockMarker = {
  setPosition: jest.fn(),
  setMap: jest.fn(),
};

window.google = {
  maps: {
    Geocoder: jest.fn(() => mockGeocoder),
    Map: jest.fn(() => mockMap),
    Marker: jest.fn(() => mockMarker),
    LatLng: jest.fn((lat, lng) => ({ lat, lng })),
    LatLngBounds: jest.fn(() => ({
      extend: jest.fn(),
    })),
    places: {
      Autocomplete: jest.fn(() => ({
        addListener: jest.fn(),
        getPlace: jest.fn(() => ({
          geometry: {
            location: {
              lat: () => 0,
              lng: () => 0,
            },
          },
          formatted_address: "",
        })),
      })),
    },
  },
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
