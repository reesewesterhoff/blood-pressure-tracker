// Test setup file for Jest

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | undefined;

// Setup test database connection.
// If MONGO_TEST_URI is provided, connect to that instance (useful for pointing
// at a local Mongo). Otherwise spin up an ephemeral in-memory MongoDB so tests
// need no external database (e.g. in CI).
beforeAll(async () => {
  let mongoUri = process.env.MONGO_TEST_URI;

  if (!mongoUri) {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
  }

  await mongoose.connect(mongoUri, {
    maxPoolSize: 5,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
