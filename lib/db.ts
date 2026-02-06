import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection string for the local Docker database
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5177/hilfevonnebenan';

// Create the connection
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
