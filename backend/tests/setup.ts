import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test', debug: false });

global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

process.env.NODE_ENV = 'test';
process.env.SKIP_DB_SETUP = 'true';
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-unit-tests';

jest.setTimeout(30000);

jest.mock('../src/config/database.config', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  },
}));

beforeAll(() => {
});

afterAll(() => {
  jest.clearAllMocks();
});