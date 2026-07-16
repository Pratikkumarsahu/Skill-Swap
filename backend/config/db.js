// Database configuration file using mongoose
import mongoose from 'mongoose';
import dns from 'dns';

// Force Node.js to use IPv4 DNS resolution first (fixes connection bug on some ISPs)
dns.setDefaultResultOrder('ipv4first');

// Connect to MongoDB function
const connectDB = async () => {
  try {
    // Attempting to connect to MongoDB using the URI from .env file
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    // Print connection error and exit program
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
