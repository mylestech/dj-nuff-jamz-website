/**
 * Test Setup and Configuration
 * Jest testing framework setup for DJ Nuff Jamz Backend
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Global test setup
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  console.log('✅ Test database connected');
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop in-memory MongoDB
  await mongoServer.stop();
  
  console.log('✅ Test database disconnected');
});

// Test utilities
global.testUtils = {
  createTestBooking: () => ({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    eventType: 'wedding',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    eventLocation: 'Central Park, NYC',
    guestCount: 100,
    budget: 5000,
    musicPreferences: 'Jazz and R&B',
    specialRequests: 'Need wireless microphone setup'
  }),
  
  createTestContact: () => ({
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1987654321',
    subject: 'Inquiry about DJ services',
    message: 'Hi, I would like to know more about your DJ services for my corporate event.',
    urgency: 'medium'
  }),
  
  generateAuthToken: () => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { username: 'admin', role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }
};

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.LOG_LEVEL = 'error'; // Suppress logs during testing

