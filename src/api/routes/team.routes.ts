import { Router } from 'express';
import { createTeam, getMyTeams, inviteMember } from '../controllers/team.controller';
import { protect } from '../middlewares/auth.middleware';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateTeamDto, InviteMemberDto } from '../dtos/team.dto';
import { checkTeamRole } from '../middlewares/rbac.middleware';
import { TeamRole } from '../../models/teamMembership.model';

const router = Router();

// === All team routes are protected ===
router.use(protect);

// GET /api/v1/teams
// Get all teams the current user is a part of
router.get('/', getMyTeams);

// POST /api/v1/teams
// Create a new team
router.post('/', validationMiddleware(CreateTeamDto), createTeam);

// POST /api/v1/teams/:teamId/invite
// Invite a new member to a team
router.post(
  '/:teamId/invite',
  checkTeamRole([TeamRole.Admin]), // **RBAC IN ACTION!** Only Admins can invite
  validationMiddleware(InviteMemberDto),
  inviteMember
);

export default router;