import mongoose from "mongoose";
import app from "../src/app";
import config from "../src/config/db";
import logger from "../src/utils/logger";
import initialUserCreation from "../src/utils/initialUserCreation";

/**
 * Connection caching for Vercel serverless.
 *
 * Vercel reuses warm Lambda instances between requests. Without caching,
 * each request would either:
 *   a) Try to open a new connection (hitting Atlas' connection limit fast), or
 *   b) Reuse a stale/closed connection from a previous invocation.
 *
 * We cache the promise so that concurrent cold-start requests all await the
 * same single connection attempt instead of racing.
 */
let cachedConnectionPromise: Promise<typeof mongoose> | null = null;

async function connectToDatabase(): Promise<void> {
  // Already fully connected — nothing to do.
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Connection attempt already in flight — await the existing promise.
  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose.connect(config.database_url as string, {
      // Recommended serverless options
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,
      maxPoolSize: 10,             // keep pool small for serverless
      minPoolSize: 0,
    });
  }

  try {
    await cachedConnectionPromise;
    logger.info("✅ Connected to MongoDB (serverless)");

    // Seed super-admin only once per cold start
    await initialUserCreation();
  } catch (err) {
    // Reset cache so the next request retries rather than re-throwing forever
    cachedConnectionPromise = null;
    logger.error("❌ MongoDB connection failed: " + err);
    throw err;
  }
}

// Wrap the Express app so every request ensures a live DB connection first.
const handler = async (req: any, res: any) => {
  try {
    await connectToDatabase();
    // Pass the request to Express
    return app(req, res);
  } catch (error) {
    logger.error("Handler error:", error);
    res.status(503).json({ message: "Database connection failed. Please try again." });
    return;
  }
};

export default handler;
