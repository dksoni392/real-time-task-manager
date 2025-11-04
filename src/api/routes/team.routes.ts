import { Router } from 'express';
import { createTeam, getMyTeams, inviteMember } from '../controllers/team.controller';
import { protect } from '../middlewares/auth.middleware';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateTeamDto, InviteMemberDto } from '../dtos/team.dto';
import { checkTeamRole } from '../middlewares/rbac.middleware';
import { TeamRole } from '../../models/teamMembership.model';

// --- 1. IMPORT THE PROJECT ROUTER ---
import projectRoutes from './project.routes';

const router = Router();

// === All team routes are protected ===
router.use(protect);

// GET /api/v1/teams
router.get('/', getMyTeams);

// POST /api/v1/teams
router.post('/', validationMiddleware(CreateTeamDto), createTeam);

// POST /api/v1/teams/:teamId/invite
router.post(
  '/:teamId/invite',
  checkTeamRole([TeamRole.Admin]), 
  validationMiddleware(InviteMemberDto),
  inviteMember
);

// --- 2. THIS IS THE CRITICAL LINE YOU ARE LIKELY MISSING ---
// This tells the team router to hand off any request
// that matches "/:teamId/projects" to the projectRoutes file.
router.use('/:teamId/projects', projectRoutes);

export default router;