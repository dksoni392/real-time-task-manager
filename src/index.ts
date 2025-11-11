// import 'reflect-metadata'; // 👈 REQUIRED for class-validator & typeorm decorators
// import express, { Express, Request, Response } from 'express';
// import dotenv from 'dotenv';
// import http from 'http';
// import { Server } from 'socket.io';
// import path from 'path';
// import cors from 'cors'; // For allowing cross-origin requests

// import connectDB from './config/db';
// import { setupSocket } from './sockets/socketHandler';

// // Import All Routes (Removed userRoutes)
// import authRoutes from './api/routes/auth.routes';
// import teamRoutes from './api/routes/team.routes';
// import taskRoutes from './api/routes/task.routes';
// import projectApiRoutes from './api/routes/projectApi.routes';

// dotenv.config();

// // Connect to database
// connectDB();

// const app: Express = express();
// const port = process.env.PORT || 3000;

// // === 1. DEFINE YOUR DYNAMIC CLIENT_URL ===
// // This will use your production URL on Vercel
// // or fall back to your Vite URL for local dev
// const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// // === 2. CONFIGURE CORS FOR REST API ===
// // This allows your React app to make 'fetch' requests
// app.use(cors({
//   origin: CLIENT_URL,
//   credentials: true,
// }));

// // === 3. Create the HTTP server and Socket.IO server ===
// const httpServer = http.createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: CLIENT_URL, // Allow your React app to connect via WebSocket
//     methods: ['GET', 'POST'],
//   },
// });

// // === 4. Set up Socket.IO logic ===
// setupSocket(io);

// // Standard middleware
// app.use(express.json()); 

// // Make 'io' accessible to our controllers
// app.set('socketio', io);

// // === 5. API ROUTES ===
// // All your API routes are now cleanly prefixed
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/tasks', taskRoutes);
// app.use('/api/v1/teams', teamRoutes);
// app.use('/api/v1/projects', projectApiRoutes);
// // The 'userRoutes' line has been removed.

// // Simple root route
// app.get('/', (req: Request, res: Response) => {
//   res.send('Real-Time Task Manager API is running...');
// });

// // === 6. Start the server ===
// httpServer.listen(port, () => {
//   console.log(`🚀 Backend API & Socket server running on http://localhost:${port}`);
// });

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';

import connectDB from './config/db';
import { setupSocket } from './sockets/socketHandler';

// Import All Routes
import authRoutes from './api/routes/auth.routes';
import teamRoutes from './api/routes/team.routes';
import taskRoutes from './api/routes/task.routes';
import projectApiRoutes from './api/routes/projectApi.routes';
import { setupSwagger } from './config/swagger'; // <-- 1. IMPORT SWAGGER

dotenv.config();

// Connect to database
connectDB();

const app: Express = express();
const port = process.env.PORT || 3000;

// === 1. DEFINE YOUR ALLOWED ORIGINS (Simplified) ===
const VITE_DEV_URL = 'http://localhost:5173';
const PROD_URL = process.env.CLIENT_URL; // For Render

const allowedOrigins = [VITE_DEV_URL];
if (PROD_URL) {
  allowedOrigins.push(PROD_URL);
}

// === 2. CONFIGURE CORS FOR REST API ===
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// === 3. Create the HTTP server and Socket.IO server ===
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Use the same dynamic list
    methods: ['GET', 'POST'],
  },
});

// === 4. Set up Socket.IO logic ===
setupSocket(io);

// Standard middleware
app.use(express.json()); 

// Make 'io' accessible to our controllers
app.set('socketio', io);

setupSwagger(app);
// === 5. API ROUTES ===
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/projects', projectApiRoutes);

// Simple root route
app.get('/', (req: Request, res: Response) => {
  res.send('Real-Time Task Manager API is running...');
});

// === 6. Start the server ===
httpServer.listen(port, () => {
  console.log(`🚀 Backend API & Socket server running on http://localhost:${port}`);
});