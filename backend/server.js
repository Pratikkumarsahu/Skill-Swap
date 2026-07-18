import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dns from 'dns';

// Force Node.js to use IPv4 DNS resolution (fixes Render's outbound IPv6 network unreachable bugs)
dns.setDefaultResultOrder('ipv4first');
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import sessionRoutes from './routes/sessions.js';
import reviewRoutes from './routes/reviews.js';
import chatRoutes from './routes/chats.js';
import adminRoutes from './routes/admin.js';
import reportRoutes from './routes/reports.js';

// Socket handler
import socketHandler from './socket/socketHandler.js';
import User from './models/User.js';

// Initialize env variables
dotenv.config();

// Auto-migration helper: Generate unique 8-digit IDs for any existing database users
const generateUidsForExistingUsers = async () => {
  try {
    const usersWithoutUid = await User.find({ uid: { $exists: false } });
    if (usersWithoutUid.length > 0) {
      console.log(`Generating unique 8-digit IDs (uid) for ${usersWithoutUid.length} users...`);
      for (const u of usersWithoutUid) {
        let uniqueId = '';
        let exists = true;
        while (exists) {
          uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
          const dupe = await User.findOne({ uid: uniqueId });
          if (!dupe) exists = false;
        }
        u.uid = uniqueId;
        await u.save();
      }
      console.log('Successfully completed 8-digit ID migration for all users!');
    }
  } catch (error) {
    console.error('Migration error generating uids for existing users:', error);
  }
};

// Connect to MongoDB
connectDB().then(() => {
  generateUidsForExistingUsers();
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'up', time: new Date() });
});

// Setup Socket.io
socketHandler(io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
