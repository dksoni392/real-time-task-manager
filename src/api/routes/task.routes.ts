import { Router } from 'express';
import { updateTask, deleteTask } from '../controllers/task.controller';
import { protect } from '../middlewares/auth.middleware';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { UpdateTaskDto } from '../dtos/task.dto';

// --- 1. IMPORT THE RBAC MIDDLEWARE AND ROLES ---
import { checkTaskAccess } from '../middlewares/rbac.middleware';
import { TeamRole } from '../../models/teamMembership.model';

const router = Router();

// --- 2. APPLY THE 'protect' MIDDLEWARE TO ALL ROUTES ---
router.use(protect); 

// --- 3. DEFINE YOUR MIDDLEWARE CHAIN ---
// This creates a re-usable chain to check if the user is
// an Admin OR a Member, and if they have access to the task.
const canModifyTask = checkTaskAccess([TeamRole.Admin, TeamRole.Member]);

// --- 4. APPLY THE *FULL* CHAIN TO YOUR ROUTES ---

// PATCH /api/v1/tasks/:taskId
router.patch(
  '/:taskId',
  canModifyTask, // <-- THIS IS THE CRITICAL LINE YOU ARE MISSING
  validationMiddleware(UpdateTaskDto),
  updateTask
);

// DELETE /api/v1/tasks/:taskId
router.delete(
  '/:taskId',
  canModifyTask, // <-- THIS IS THE CRITICAL LINE YOU ARE MISSING
  deleteTask
);

export default router;