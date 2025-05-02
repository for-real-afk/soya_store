import { Pool } from "pg";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres"; // use correct drizzle driver
import * as schema from "@shared/schema";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

// ✅ Create the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  max: 5,
  idleTimeoutMillis: 30000,
});

// ✅ Handle unexpected pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client:", err);
});

// ✅ Initialize Drizzle with pg client and schema
export const db = drizzle(pool, { schema });
