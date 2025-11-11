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

/**
 * @swagger
 * /teams/{teamId}/projects:
 *   get:
 *     summary: Get all projects for a specific team
 *     tags: [Projects & Tasks]
 *     description: Retrieves a list of all projects for a given team, plus the user's role in that team.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the team
 *     responses:
 *       200:
 *         description: A list of projects and the user's role.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not a member of the team)
 */
// GET /api/v1/teams/:teamId/projects
router.get('/', checkTeamRole([TeamRole.Admin, TeamRole.Member]), getProjectsByTeam);

/**
 * @swagger
 * /teams/{teamId}/projects:
 *   post:
 *     summary: Create a new project in a team (Admin Only)
 *     tags: [Projects & Tasks]
 *     description: Creates a new project within a specific team. This is a global Admin-only action.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectDto'
 *     responses:
 *       201:
 *         description: Project created successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not an Admin)
 */

// POST /api/v1/teams/:teamId/projects
router.post(
  '/',
  checkTeamRole([TeamRole.Admin]),
  validationMiddleware(CreateProjectDto),
  createProject
);


router.use('/:projectId/tasks', projectTaskRoutes);

export default router;