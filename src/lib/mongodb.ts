import "server-only";

import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME ?? "choir-song";

/**
 * Singleton MongoDB client.
 *
 * Uses globalThis so Next.js dev hot-reloading does not create a new client
 * on every reload. This module is server-only — do not import it from
 * "use client" components. Call it from Server Actions, API routes, or
 * server components.
 *
 * The client is created lazily: `getMongoDb()` throws only if
 * `MONGODB_URI` is missing at call time, so modules that import this file
 * do not crash at import time when the database is not configured.
 */
declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoDb: Db | undefined;
}

let client: MongoClient | undefined = globalThis._mongoClient;
let db: Db | undefined = globalThis._mongoDb;

function getClient(): MongoClient {
  if (!client) {
    if (!uri) {
      throw new Error(
        "MONGODB_URI environment variable is required. Set it in .env.local",
      );
    }
    client = new MongoClient(uri);
    globalThis._mongoClient = client;
  }
  return client;
}

function getDb(): Db {
  if (!db) {
    const c = getClient();
    db = c.db(dbName);
    globalThis._mongoDb = db;
  }
  return db!;
}

/** Get the connected MongoDB Db instance. */
export function getMongoDb(): Db {
  return getDb();
}

/** Close the MongoDB client (useful for tests / teardown). */
export async function closeMongoDb(): Promise<void> {
  if (client) {
    await client.close();
    globalThis._mongoClient = undefined;
    globalThis._mongoDb = undefined;
    client = undefined;
    db = undefined;
  }
}