import { Router } from 'express';
import { createTeam, deleteTeam, getMyTeams, inviteMember } from '../controllers/team.controller';
import { protect,isAdmin } from '../middlewares/auth.middleware';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateTeamDto, InviteMemberDto } from '../dtos/team.dto';
import { checkTeamRole } from '../middlewares/rbac.middleware';
import { TeamRole } from '../../models/teamMembership.model';

// --- 1. IMPORT THE PROJECT ROUTER ---
import projectRoutes from './project.routes';

const router = Router();
/**
 * @swagger
 * tags:
 *  name: Teams
 *  description: Team creation and management
 */

// === All team routes are protected ===
router.use(protect);

/**
 * @swagger
 * /teams:
 *  get:
 *    summary: Get all teams for the current user
 *    tags: [Teams]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: A list of the user's team memberships (with team data, role, and member count).
 *      401:
 *        description: Unauthorized
 */
// GET /api/v1/teams
router.get('/', getMyTeams);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team (Admin Only)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeamDto'
 *     responses:
 *       201:
 *         description: Team created successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not an Admin)
 */
// POST /api/v1/teams
router.post('/', validationMiddleware(CreateTeamDto), createTeam);


/**
 * @swagger
 * /teams/{teamId}/invite:
 *   post:
 *     summary: Invite a user to a team (Admin Only)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the team to invite to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InviteMemberDto'
 *     responses:
 *       201:
 *         description: User invited successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not an Admin)
 *       404:
 *         description: User or Team not found
 */

// POST /api/v1/teams/:teamId/invite
router.post(
  '/:teamId/invite',
  checkTeamRole([TeamRole.Admin]), 
  validationMiddleware(InviteMemberDto),
  inviteMember
);

/**
 * @swagger
 * /teams/{teamId}:
 *   delete:
 *     summary: Delete a team (Admin Only)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the team to delete
 *     responses:
 *       200:
 *         description: Team deleted successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not an Admin)
 *       404:
 *         description: Team not found
 */

router.delete('/:teamId', isAdmin, deleteTeam);

// --- 2. THIS IS THE CRITICAL LINE YOU ARE LIKELY MISSING ---
// This tells the team router to hand off any request
// that matches "/:teamId/projects" to the projectRoutes file.
router.use('/:teamId/projects', projectRoutes);

export default router;