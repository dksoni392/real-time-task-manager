import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import http from 'http'; // <-- 1. Import http
import { Server } from 'socket.io'; // <-- 2. Import Socket.IO Server
import { setupSocket } from './sockets/socketHandler'; // <-- 3. Import our new handler

// Import Routes
import authRoutes from './api/routes/auth.routes';
import teamRoutes from './api/routes/team.routes';
import taskRoutes from './api/routes/task.routes';

dotenv.config();

// Connect to database
connectDB();

const app: Express = express();
const port = process.env.PORT || 3000;

// === 4. Create the HTTP server and Socket.IO server ===
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // For development. In prod, lock this to your frontend URL
    methods: ['GET', 'POST'],
  },
});

// === 5. Run our Socket.IO setup ===
setupSocket(io);

// Middleware to parse JSON
app.use(express.json());

// === 6. Make 'io' accessible to our controllers ===
// This is a clean way to do dependency injection
app.set('socketio', io);

// A simple root route for health check
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// === USE API ROUTES ===
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/teams', teamRoutes);

// === 7. Start the server using the 'httpServer' ===
// (NOT app.listen())
httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});