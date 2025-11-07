import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { checkProjectAccess } from '../middlewares/rbac.middleware';
import { TeamRole } from '../../models/teamMembership.model';

// --- 1. IMPORT THE create-task LOGIC AND VALIDATOR ---
import { getTasksByProject, createTask } from '../controllers/task.controller';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateTaskDto } from '../dtos/task.dto';

const router = Router();
router.use(protect); // All routes in this file are protected

// --- 2. THIS IS YOUR EXISTING, WORKING ROUTE ---
router.get(
  '/:projectId/tasks',
  checkProjectAccess([TeamRole.Admin, TeamRole.Member]),
  getTasksByProject
);

// --- 3. THIS IS THE NEW ROUTE YOU ARE ADDING ---
// It handles the "Create Task" form submission
router.post(
  '/:projectId/tasks',
  checkProjectAccess([TeamRole.Admin, TeamRole.Member]), // Only team members can create
  validationMiddleware(CreateTaskDto), // Validates the form data
  createTask // Reuses your existing controller
);

export default router;