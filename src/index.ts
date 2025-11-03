import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './api/routes/auth.routes';
import teamRoutes from './api/routes/team.routes'; // Import team routes
// import projectRoutes from './api/routes/project.routes'; // Stub for next step
// import taskRoutes from './api/routes/task.routes'; // Stub for next step

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
app.use('/api/v1/teams', teamRoutes); // Plug in the team routes
// app.use('/api/v1/projects', projectRoutes); // Stub for next step
// app.use('/api/v1/tasks', taskRoutes); // Stub for next step

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});