import { Router } from 'express';
import { createTask, getTasksByProject } from '../controllers/task.controller';
import { protect } from '../middlewares/auth.middleware';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateTaskDto } from '../dtos/task.dto';
import { checkProjectAccess } from '../middlewares/rbac.middleware';
import { TeamRole } from '../../models/teamMembership.model';

// **CRITICAL**: { mergeParams: true } to access :projectId
const router = Router({ mergeParams: true });
router.use(protect);

// Use the RBAC middleware for ALL routes in this file
// This ensures the user is a member of the project's team
router.use(checkProjectAccess([TeamRole.Admin, TeamRole.Member]));

// POST /api/v1/projects/:projectId/tasks
router.post('/', validationMiddleware(CreateTaskDto), createTask);

// GET /api/v1/projects/:projectId/tasks
router.get('/', getTasksByProject);

export default router;