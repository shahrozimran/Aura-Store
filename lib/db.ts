import mongoose from 'mongoose';

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<mongoose.Connection> {
  if (cached && cached.conn) {
    return cached.conn;
  }

  if (cached && !cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside your .env configuration file.'
      );
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
    console.log('MongoDB Disconnected.');
  }
}
