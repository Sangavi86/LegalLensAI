import mongoose from 'mongoose';
import { config } from '../../config/app.config';

let isConnected = false;

/**
 * Connect to MongoDB.
 * Idempotent — safe to call multiple times.
 */
export async function connectDatabase(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB connected');

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB.
 * Used for graceful shutdown and tests.
 */
export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('MongoDB disconnected cleanly');
}

export { mongoose };
