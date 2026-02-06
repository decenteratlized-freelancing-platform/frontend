import mongoose from 'mongoose';

export async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Missing MONGO_URI (or MONGODB_URI) env variable');
    }
    await mongoose.connect(uri, {
      dbName: 'smarthire_db',
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
