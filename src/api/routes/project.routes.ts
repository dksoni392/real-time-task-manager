import { Router } from 'express';
import { createProject, getProjectsByTeam } from '../controllers/project.controller';
import { protect } from '../middlewares/auth.middleware';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateProjectDto } from '../dtos/project.dto';
import { checkTeamRole } from '../middlewares/rbac.middleware';
import { TeamRole } from '../../models/teamMembership.model';

// --- 1. IMPORT THE NESTED TASK ROUTER ---
import projectTaskRoutes from './projectTask.routes';

// **CRITICAL**: { mergeParams: true } must be here
const router = Router({ mergeParams: true });

// All project routes are protected
router.use(protect);

// GET /api/v1/teams/:teamId/projects
router.get('/', checkTeamRole([TeamRole.Admin, TeamRole.Member]), getProjectsByTeam);

// POST /api/v1/teams/:teamId/projects
router.post(
  '/',
  checkTeamRole([TeamRole.Admin]),
  validationMiddleware(CreateProjectDto),
  createProject
);


router.use('/:projectId/tasks', projectTaskRoutes);

export default router;