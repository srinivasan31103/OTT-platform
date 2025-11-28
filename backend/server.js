import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import connectDB from './config/db.js';
import { connectRedis, getRedisClient } from './config/redis.js';

import SocketManager from './socket.js';
import WebRTCSignalingServer from './webrtc.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import seriesRoutes from './routes/seriesRoutes.js';
import episodeRoutes from './routes/episodeRoutes.js';
import watchRoutes from './routes/watchRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import partyRoutes from './routes/partyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import shortsRoutes from './routes/shortsRoutes.js';
import adRoutes from './routes/adRoutes.js';
import liveTVRoutes from './routes/liveTVRoutes.js';
import contentRoutes from './routes/contentRoutes.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = http.createServer(app);

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ========================
// MIDDLEWARE
// ========================

// Security middleware
app.use(helmet());

// CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Compression middleware
app.use(compression());

// Morgan logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Custom request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ========================
// SOCKET.IO & WebRTC SETUP
// ========================

// Initialize Socket.IO
const socketManager = new SocketManager(httpServer);
const io = socketManager.getIO();

// Initialize WebRTC Signaling Server
const webrtcServer = new WebRTCSignalingServer(io);

// Make socket manager and webrtc available to routes
app.use((req, res, next) => {
  req.io = io;
  req.socketManager = socketManager;
  req.webrtcServer = webrtcServer;
  next();
});

// ========================
// HEALTH CHECK ENDPOINTS
// ========================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),
    environment: NODE_ENV,
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'StreamVerse OTT Backend is running',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// ========================
// API ROUTES
// ========================

// Auth routes
app.use('/api/auth', authRoutes);

// Movie routes
app.use('/api/movies', movieRoutes);

// Series routes
app.use('/api/series', seriesRoutes);

// Episode routes
app.use('/api/episodes', episodeRoutes);

// Watch history routes
app.use('/api/watch', watchRoutes);

// Watchlist routes
app.use('/api/watchlist', watchlistRoutes);

// Subscription routes
app.use('/api/subscriptions', subscriptionRoutes);

// Profile routes
app.use('/api/profiles', profileRoutes);

// Watch party routes
app.use('/api/party', partyRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// Shorts routes
app.use('/api/shorts', shortsRoutes);

// Live TV routes
app.use('/api/live-tv', liveTVRoutes);

// Content routes (trending, recommendations, search)
app.use('/api', contentRoutes);

// Ads & Banners routes
app.use('/api', adRoutes);

// ========================
// ERROR HANDLING
// ========================

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(status).json({
    status: 'error',
    message,
    ...(NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// ========================
// DATABASE CONNECTIONS
// ========================

async function initializeConnections() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');

    // Connect to Redis
    console.log('Connecting to Redis...');
    await connectRedis();
    const redis = getRedisClient();
    if (redis && redis.isOpen) {
      console.log('✅ Redis Connected');
    }

    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// ========================
// SERVER STARTUP
// ========================

async function startServer() {
  try {
    // Initialize database connections
    const connected = await initializeConnections();

    if (!connected) {
      console.error('Failed to connect to databases. Exiting...');
      process.exit(1);
    }

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║          StreamVerse OTT Backend Server Started          ║
╚══════════════════════════════════════════════════════════╝

Environment: ${NODE_ENV}
Server: http://localhost:${PORT}
Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
WebSocket: ws://localhost:${PORT}

Timestamp: ${new Date().toISOString()}
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      httpServer.close(() => {
        console.log('HTTP server closed');
        const redis = getRedisClient();
        if (redis) redis.disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      httpServer.close(() => {
        console.log('HTTP server closed');
        const redis = getRedisClient();
        if (redis) redis.disconnect();
        process.exit(0);
      });
    });

    // Periodic WebRTC cleanup
    setInterval(() => {
      webrtcServer.cleanupDisconnectedPeers();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Error handlers
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
