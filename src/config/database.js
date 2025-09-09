// src/config/database.js
const { MongoClient } = require('mongodb');
const { logger } = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'university_db';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'universities';

let client;
let database;
let collection;

async function connectDatabase() {
  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    database = client.db(DATABASE_NAME);
    collection = database.collection(COLLECTION_NAME);

    // Create indexes for better performance
    await createIndexes();

    logger.info(`✓ Connected to MongoDB: ${DATABASE_NAME}.${COLLECTION_NAME}`);
    return { client, database, collection };
  } catch (error) {
    logger.error('✗ MongoDB connection error:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    const indexes = [
      // Text search index for multiple fields
      {
        key: {
          'institution.name': 'text',
          'institution.short_name': 'text',
          'general_information.address.city': 'text',
          'divisions.name': 'text',
          'degrees.programs.name': 'text'
        },
        options: {
          name: 'text_search_index',
          weights: {
            'institution.name': 10,
            'institution.short_name': 8,
            'general_information.address.city': 5,
            'divisions.name': 3,
            'degrees.programs.name': 2
          }
        }
      },
      // Individual field indexes
      { key: { 'institution.iau_id': 1 }, options: { unique: true, sparse: true } },
      { key: { 'institution.name': 1 } },
      { key: { 'institution.country_line': 1 } },
      { key: { 'general_information.address.city': 1 } },
      { key: { 'general_information.address.country': 1 } },
      { key: { 'general_information.type': 1 } },
      { key: { 'general_information.status': 1 } },
      { key: { 'institution.updated_on': -1 } },
      
      // Compound indexes for common queries
      { key: { 'institution.country_line': 1, 'institution.name': 1 } },
      { key: { 'general_information.address.city': 1, 'institution.country_line': 1 } }
    ];

    for (const index of indexes) {
      try {
        await collection.createIndex(index.key, index.options || {});
      } catch (error) {
        // Ignore duplicate key errors for existing indexes
        if (error.code !== 85) {
          logger.warn(`Failed to create index ${JSON.stringify(index.key)}:`, error.message);
        }
      }
    }

    logger.info('✓ Database indexes created/verified');
  } catch (error) {
    logger.error('✗ Error creating indexes:', error);
  }
}

function getDatabase() {
  if (!database) {
    throw new Error('Database not connected');
  }
  return database;
}

function getCollection() {
  if (!collection) {
    throw new Error('Collection not available');
  }
  return collection;
}

async function closeConnection() {
  if (client) {
    await client.close();
    logger.info('✓ MongoDB connection closed');
  }
}

module.exports = {
  connectDatabase,
  getDatabase,
  getCollection,
  closeConnection
};
