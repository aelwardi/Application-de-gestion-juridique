import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test', debug: false });

process.env.NODE_ENV = 'test';
process.env.SKIP_DB_SETUP = 'true';
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-unit-tests';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.BCRYPT_ROUNDS = '10';

jest.setTimeout(30000);

global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

jest.mock('../src/config/database.config', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn().mockResolvedValue({
      query: jest.fn(),
      release: jest.fn(),
    }),
    end: jest.fn(),
  },
}));

beforeAll(() => {
});

afterAll(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
});