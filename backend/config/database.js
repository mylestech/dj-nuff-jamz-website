/**
 * Database Configuration
 * MongoDB connection setup and management
 */

const mongoose = require('mongoose');

class DatabaseConfig {
  constructor() {
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const connectionString = this.getConnectionString();
      
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      };

      await mongoose.connect(connectionString, options);
      
      this.isConnected = true;
      this.connectionRetries = 0;
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📍 Database: ${mongoose.connection.name}`);
      
      // Handle connection events
      this.setupEventListeners();
      
    } catch (error) {
      this.isConnected = false;
      this.connectionRetries++;
      
      console.error('❌ MongoDB connection error:', error.message);
      
      if (this.connectionRetries < this.maxRetries) {
        console.log(`🔄 Retrying connection... (${this.connectionRetries}/${this.maxRetries})`);
        setTimeout(() => this.connect(), 5000);
      } else {
        console.error('💥 Max connection retries reached. Exiting...');
        process.exit(1);
      }
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('🔌 MongoDB disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  /**
   * Get MongoDB connection string
   */
  getConnectionString() {
    const {
      MONGODB_URI,
      MONGODB_HOST = 'localhost',
      MONGODB_PORT = '27017',
      MONGODB_DATABASE = 'djnuffjamz',
      MONGODB_USERNAME,
      MONGODB_PASSWORD
    } = process.env;

    // Use MONGODB_URI if provided (for production/cloud)
    if (MONGODB_URI) {
      return MONGODB_URI;
    }

    // Build connection string for local development
    let connectionString = 'mongodb://';
    
    if (MONGODB_USERNAME && MONGODB_PASSWORD) {
      connectionString += `${MONGODB_USERNAME}:${MONGODB_PASSWORD}@`;
    }
    
    connectionString += `${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
    
    return connectionString;
  }

  /**
   * Setup MongoDB event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error.message);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      this.isConnected = true;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Check if database is connected
   */
  isHealthy() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

module.exports = new DatabaseConfig();

