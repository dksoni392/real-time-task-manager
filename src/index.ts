import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Import Routes
import authRoutes from './api/routes/auth.routes';
import teamRoutes from './api/routes/team.routes'; // This now includes project & task routes!
import taskRoutes from './api/routes/task.routes'; // For individual task updates

dotenv.config();

// Connect to database
connectDB();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// === USE API ROUTES ===
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes); // For /api/v1/tasks/:taskId
app.use('/api/v1/teams', teamRoutes); // For /api/v1/teams AND all nested routes

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});