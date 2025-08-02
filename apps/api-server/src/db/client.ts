import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema.js';

const { Pool } = pkg;

// For demo purposes, use a simple connection string or default to a local postgres
const connectionString = process.env.DATABASE_URL || 'postgresql://stock_user:stock_pass@localhost:5432/stock_db';

export const pool = new Pool({
  connectionString
});

export const db = drizzle(pool, { schema });