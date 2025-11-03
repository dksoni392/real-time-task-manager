import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;