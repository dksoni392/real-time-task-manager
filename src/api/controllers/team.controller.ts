import { Request, Response } from 'express';
import { Team } from '../../models/team.model';
import { User } from '../../models/user.model';
import {
  TeamMembership,
  TeamRole,
} from '../../models/teamMembership.model';
import { CreateTeamDto, InviteMemberDto } from '../dtos/team.dto';
import { logActivity } from '../../services/activity.service';
import { Types } from 'mongoose';

// @desc    Create a new team
// @route   POST /api/v1/teams
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body as CreateTeamDto;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // 1. Create the team
    const team = await Team.create({ name, description });

    // 2. Automatically create the 'Admin' membership for the creator
    await TeamMembership.create({
      user: userId,
      team: team._id,
      role: TeamRole.Admin,
    });

    // 3. Log this action
    await logActivity(
      userId as Types.ObjectId,
      team._id as Types.ObjectId,
      'TEAM_CREATED',
      `User ${req.user?.name} created team "${team.name}"`
    );

    res.status(201).json(team);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Invite a member to a team
// @route   POST /api/v1/teams/:teamId/invite
export const inviteMember = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body as InviteMemberDto;
    const { teamId } = req.params;
    const adminUser = req.user; // The admin performing the invite

    // 1. Find the user to invite by their email
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // 2. Check if user is *already* on the team
    const existingMembership = await TeamMembership.findOne({
      user: userToInvite._id,
      team: teamId,
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'User is already on this team' });
    }

    // 3. Create the new membership
    const newMembership = await TeamMembership.create({
      user: userToInvite._id,
      team: teamId,
      role: role,
    });

    // 4. Log the activity
    await logActivity(
      adminUser?._id as Types.ObjectId,
      new Types.ObjectId(teamId),
      'MEMBER_INVITED',
      `User ${adminUser?.name} invited ${userToInvite.name} as a ${role}`
    );

    res.status(201).json(newMembership);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all teams for the current user
// @route   GET /api/v1/teams
export const getMyTeams = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    // Find all memberships for the user
    const memberships = await TeamMembership.find({ user: userId }).populate(
      'team' // 'team' is the 'ref' field in TeamMembership model
    );

    // Extract just the team data
    const teams = memberships.map((mem) => mem.team);

    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ... You can add more controllers here (e.g., getTeamById, removeMember, etc.)