const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config();

// Check if database connection string is available
if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

// Create database connection
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

module.exports = { db, client };