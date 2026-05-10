import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import logger from "./utils/logger"; 
import routes from "./routes";
import config from "./config/db";

import { errorHandler } from "./middlewares/errorHandler";
import { rateLimiter } from "./middlewares/rateLimiter";

const app: Application = express();

app.use(helmet());

// CORS Configuration - support both development and production URLs
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Merge hardcoded production URLs with env-configured ones
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://maritime-fe.vercel.app',
      config.client_url,
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, false); // Don't throw error, just don't allow
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests globally
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(rateLimiter);
app.use(
  morgan(":method :url :status - :response-time ms", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  logger.info("Root endpoint was called 🌐");
  res.send("API is up and running!!!");
});

app.get("/health", (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;

  // MongoDB connection states
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  logger.info("Health check endpoint was called !!!");
  res.status(200).json({
    status: "ok",
    server: "running",
    database: states[dbState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.get("/favicon.ico", (req: Request, res: Response) => res.status(204).end());
app.use("/v1", routes);

// Global Error Handler
app.use(errorHandler);

export default app;
