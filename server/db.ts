import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with better error handling and connection management
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,  // Connection timeout
  max: 5,                        // Maximum number of clients the pool should contain
  idleTimeoutMillis: 30000       // How long a client is allowed to remain idle before being closed
});

// Handle pool errors to prevent application crashes
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  // Don't crash the server on connection errors
});

export const db = drizzle({ client: pool, schema });
