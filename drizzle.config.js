// drizzle.config.js
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './api/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql', // Use 'dialect' instead of 'driver' for newer versions
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/bookreview',
  },
  verbose: true,
  strict: true,
  // This is the key fix - specify the bundle configuration
  bundle: {
    target: 'node16', // or 'node18', 'esnext'
    format: 'esm'
  }
});