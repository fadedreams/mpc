import { Config } from '../config';
import dotenv from 'dotenv';

jest.mock('dotenv');

describe('Config', () => {
  beforeEach(() => {
    jest.resetModules(); // Reset modules before each test
  });

  it('should initialize with default values when environment variables are not set', () => {
    const config = new Config();
    expect(config).toBeInstanceOf(Config);

    expect(config.NODE_ENV).toBe('test'); // Adjust the expected value accordingly
    // ... other assertions ...

    expect(dotenv.config).toHaveBeenCalled();
  });

  it('should initialize with provided environment variables', () => {
    process.env.NODE_ENV = 'test';
    process.env.CLIENT_URL = 'http://test-client-url';
    // ... set other environment variables ...

    const config = new Config();
    expect(config).toBeInstanceOf(Config);

    expect(config.NODE_ENV).toBe('test');
    expect(config.CLIENT_URL).toBe('http://test-client-url');
    // ... other assertions ...

    expect(dotenv.config).toHaveBeenCalled();
  });
});
