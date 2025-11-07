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
import { Server } from 'socket.io'; // Import Socket.IO Server


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

    // --- 4. THIS IS THE FIX ---
    // Emit the 'added_to_team' event to the creator's *personal room*.
    // Your TeamDashboard.jsx is already listening for this!
    const io: Server = req.app.get('socketio');
    const personalRoom = (userId as Types.ObjectId).toString();
    io.to(personalRoom).emit('added_to_team', team);
    // --- END OF FIX ---

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

    // --- THIS IS THE FIX ---
    // Assert the type of _id ONCE and store it in a clean variable
    const userToInviteId = userToInvite._id as Types.ObjectId;
    // --- END OF FIX ---

    // 2. Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // 3. Check if user is *already* on the team (using the typed variable)
    const existingMembership = await TeamMembership.findOne({
      user: userToInviteId,
      team: teamId,
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'User is already on this team' });
    }

    // 4. Create the new membership (using the typed variable)
    const newMembership = await TeamMembership.create({
      user: userToInviteId,
      team: teamId,
      role: role,
    });

    // 5. Log the activity
    await logActivity(
      adminUser?._id as Types.ObjectId,
      team._id as Types.ObjectId, // Fixed
      'MEMBER_INVITED',
      `User ${adminUser?.name} invited ${userToInvite.name} as a ${role}`
    );

    // --- 6. EMIT SOCKET.IO EVENTS ---
    const io: Server = req.app.get('socketio');
    const teamRoom = (team._id as Types.ObjectId).toString(); // Fixed
    const personalRoom = userToInviteId.toString(); // Use the typed variable

    // Event 1: Notify everyone *already* in the team room
    const newMemberPayload = {
      _id: userToInviteId, // Use the typed variable
      name: userToInvite.name,
      email: userToInvite.email,
      role: newMembership.role,
    };
    io.to(teamRoom).emit('member_joined', newMemberPayload);

    // Event 2: Notify the *newly added user* in their personal room
    io.to(personalRoom).emit('added_to_team', team);
    
    // --- END OF SOCKET.IO LOGIC ---

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

    // 1. Find all memberships for the user, and populate the team data
    const memberships = await TeamMembership.find({ user: userId }).populate(
      'team'
    );

    // 2. For each membership, fetch the total member count for that team
    // We use Promise.all to run all these database queries in parallel
    const teamsData = await Promise.all(
      memberships.map(async (mem) => {
        // We must cast 'mem.team' because populate doesn't type it
        const team = mem.team as any; 
        
        // Count all documents in TeamMembership for this teamId
        const memberCount = await TeamMembership.countDocuments({
          team: team._id,
        });
        
        // 3. Return the rich object
        return {
          team: team,                 // The full team object
          role: mem.role,             // The user's role for this team
          memberCount: memberCount,   // The total member count
        };
      })
    );

    res.status(200).json(teamsData);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};