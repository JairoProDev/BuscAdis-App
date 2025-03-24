import { Logger } from './logging.service';

describe('LoggingService', () => {
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('info', () => {
    it('logs info message with default options', () => {
      const message = 'Test info message';
      Logger.info(message);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO]',
        message,
        expect.any(String), // timestamp
        ''
      );
    });

    it('logs info message with details', () => {
      const message = 'Test info message';
      const details = { test: true };
      Logger.info(message, { details });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO]',
        message,
        expect.any(String), // timestamp
        details
      );
    });

    it('logs info message with component', () => {
      const message = 'Test info message';
      const component = 'TestComponent';
      Logger.info(message, { component });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO]',
        `[${component}]`,
        message,
        expect.any(String), // timestamp
        ''
      );
    });
  });

  describe('error', () => {
    it('logs error message with default options', () => {
      const message = 'Test error message';
      Logger.error(message);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR]',
        message,
        expect.any(String), // timestamp
        ''
      );
    });

    it('logs error message with error object', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      Logger.error(message, { details: error });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR]',
        message,
        expect.any(String), // timestamp
        error
      );
    });

    it('logs error message with component and details', () => {
      const message = 'Test error message';
      const component = 'TestComponent';
      const details = { error: 'Test error' };
      Logger.error(message, { component, details });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR]',
        `[${component}]`,
        message,
        expect.any(String), // timestamp
        details
      );
    });
  });

  describe('success', () => {
    it('logs success message with default options', () => {
      const message = 'Test success message';
      Logger.success(message);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[SUCCESS]',
        message,
        expect.any(String), // timestamp
        ''
      );
    });

    it('logs success message with details', () => {
      const message = 'Test success message';
      const details = { success: true };
      Logger.success(message, { details });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[SUCCESS]',
        message,
        expect.any(String), // timestamp
        details
      );
    });
  });

  describe('warning', () => {
    it('logs warning message with default options', () => {
      const message = 'Test warning message';
      Logger.warn(message);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARNING]',
        message,
        expect.any(String), // timestamp
        ''
      );
    });

    it('logs warning message with details', () => {
      const message = 'Test warning message';
      const details = { warning: true };
      Logger.warn(message, { details });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARNING]',
        message,
        expect.any(String), // timestamp
        details
      );
    });
  });

  describe('debug', () => {
    it('logs debug message with default options', () => {
      const message = 'Test debug message';
      Logger.debug(message);

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[DEBUG]',
        message,
        expect.any(String), // timestamp
        ''
      );
    });

    it('logs debug message with details', () => {
      const message = 'Test debug message';
      const details = { debug: true };
      Logger.debug(message, { details });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[DEBUG]',
        message,
        expect.any(String), // timestamp
        details
      );
    });
  });

  describe('timestamp formatting', () => {
    it('formats timestamp correctly', () => {
      const message = 'Test message';
      Logger.info(message);

      const timestampRegex = /\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/;
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO]',
        message,
        expect.stringMatching(timestampRegex),
        ''
      );
    });
  });

  describe('error handling', () => {
    it('handles circular references in details', () => {
      const message = 'Test message';
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj;

      Logger.info(message, { details: circularObj });

      expect(consoleInfoSpy).toHaveBeenCalled();
      // Verify that the circular reference was handled without throwing
    });

    it('handles undefined details', () => {
      const message = 'Test message';
      Logger.info(message, { details: undefined });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO]',
        message,
        expect.any(String), // timestamp
        ''
      );
    });

    it('handles non-object details', () => {
      const message = 'Test message';
      Logger.info(message, { details: 'string details' });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO]',
        message,
        expect.any(String), // timestamp
        'string details'
      );
    });
  });
}); 