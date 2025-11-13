import "reflect-metadata";

beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.JWT_EXPIRES_IN = "1d";
process.env.PORT = "4000";
process.env.FRONTEND_URL = "http://localhost:5173";

jest.mock("../config/redis", () => ({
  client: {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
    isOpen: true,
    connect: jest.fn(),
    on: jest.fn(),
  },
}));

jest.mock("@sentry/node", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
}));

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

jest.mock("../utils/logger", () => ({
  __esModule: true,
  default: mockLogger,
  logger: mockLogger,
}));
