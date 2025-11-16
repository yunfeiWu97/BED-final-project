// Always mock firestore in every test
jest.mock("../config/firebaseConfig", () => ({
  auth: {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  },
  db: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
    batch: jest.fn(),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.resetModules();
});

/**
 * Test-only mock for express-rate-limit to avoid option validation noise.
 * We keep routes intact, just no-op the middleware in Jest.
 */
jest.mock("express-rate-limit", () => {
  const noOp = () => (_req: any, _res: any, next: any) => next();
  const ipKeyGenerator = () => "test-ip";
  return { __esModule: true, default: noOp, ipKeyGenerator };
});