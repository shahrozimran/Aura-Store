import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
  mongoServer: MongoMemoryServer | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, mongoServer: null };
}

export async function connectDB(): Promise<mongoose.Connection> {
  if (cached && cached.conn) {
    return cached.conn;
  }

  if (cached && !cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log('No MONGODB_URI found in environment. Initializing in-memory MongoDB server...');
      if (!cached.mongoServer) {
        cached.mongoServer = await MongoMemoryServer.create();
      }
      mongoUri = cached.mongoServer.getUri();
      console.log(`In-memory MongoDB server started successfully at ${mongoUri}`);
    }

    cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
      console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
      console.log(`Database Name: ${mongooseInstance.connection.name}`);
      return mongooseInstance.connection;
    });
  }

  try {
    if (cached) {
      cached.conn = await cached.promise;
    }
  } catch (error) {
    if (cached) {
      cached.promise = null;
    }
    throw error;
  }

  return cached?.conn as mongoose.Connection;
}

export async function closeDB() {
  if (cached && cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
  if (cached && cached.mongoServer) {
    await cached.mongoServer.stop();
    cached.mongoServer = null;
    console.log('In-memory MongoDB server stopped.');
  }
}
