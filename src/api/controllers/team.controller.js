"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTeams = exports.inviteMember = exports.createTeam = void 0;
const team_model_1 = require("../../models/team.model");
const user_model_1 = require("../../models/user.model");
const teamMembership_model_1 = require("../../models/teamMembership.model");
const activity_service_1 = require("../../services/activity.service");
// @desc    Create a new team
// @route   POST /api/v1/teams
const createTeam = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user?._id;
        const userRole = req.user?.role; // <-- 1. Get the user's role
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // === 2. THIS IS THE FIX ===
        // We must check if the user has the global 'Admin' role
        if (userRole !== 'Admin') {
            return res.status(403).json({
                message: 'Forbidden: You do not have permission to create a new team.'
            });
        }
        // === END OF FIX ===
        // 3. Create the team
        const team = await team_model_1.Team.create({ name, description });
        // 4. Automatically create the 'Admin' membership for the creator
        await teamMembership_model_1.TeamMembership.create({
            user: userId,
            team: team._id,
            role: teamMembership_model_1.TeamRole.Admin,
        });
        // 5. Log this action
        await (0, activity_service_1.logActivity)(userId, team._id, 'TEAM_CREATED', `User ${req.user?.name} created team "${team.name}"`);
        // 6. Emit the 'added_to_team' event to the creator's *personal room*.
        const io = req.app.get('socketio');
        const personalRoom = userId.toString();
        io.to(personalRoom).emit('added_to_team', team);
        res.status(201).json(team);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createTeam = createTeam;
// @desc    Invite a member to a team
// @route   POST /api/v1/teams/:teamId/invite
const inviteMember = async (req, res) => {
    try {
        const { email, role } = req.body;
        const { teamId } = req.params;
        const adminUser = req.user; // The admin performing the invite
        // === 1. THIS IS THE FIX ===
        // We must check if the user has the global 'Admin' role
        if (adminUser?.role !== 'Admin') {
            return res.status(403).json({
                message: 'Forbidden: You do not have permission to invite members.'
            });
        }
        // === END OF FIX ===
        // 2. Find the user to invite by their email
        const userToInvite = await user_model_1.User.findOne({ email });
        if (!userToInvite) {
            return res.status(404).json({ message: 'User with this email not found' });
        }
        const userToInviteId = userToInvite._id;
        // 3. Find team
        const team = await team_model_1.Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        // 4. Check if user is *already* on the team
        const existingMembership = await teamMembership_model_1.TeamMembership.findOne({
            user: userToInviteId,
            team: teamId,
        });
        if (existingMembership) {
            return res.status(400).json({ message: 'User is already on this team' });
        }
        // 5. Create the new membership
        const newMembership = await teamMembership_model_1.TeamMembership.create({
            user: userToInviteId,
            team: teamId,
            role: role,
        });
        // 6. Log the activity
        await (0, activity_service_1.logActivity)(adminUser?._id, team._id, 'MEMBER_INVITED', `User ${adminUser?.name} invited ${userToInvite.name} as a ${role}`);
        // 7. EMIT SOCKET.IO EVENTS
        const io = req.app.get('socketio');
        const teamRoom = team._id.toString();
        const personalRoom = userToInviteId.toString();
        // Event 1: Notify everyone *already* in the team room
        const newMemberPayload = {
            _id: userToInviteId,
            name: userToInvite.name,
            email: userToInvite.email,
            role: newMembership.role,
        };
        io.to(teamRoom).emit('member_joined', newMemberPayload);
        // Event 2: Notify the *newly added user* in their personal room
        io.to(personalRoom).emit('added_to_team', team);
        res.status(201).json(newMembership);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.inviteMember = inviteMember;
// @desc    Get all teams for the current user
// @route   GET /api/v1/teams
const getMyTeams = async (req, res) => {
    try {
        const userId = req.user?._id;
        // 1. Find all memberships for the user, and populate the team data
        const memberships = await teamMembership_model_1.TeamMembership.find({ user: userId }).populate('team');
        // 2. For each membership, fetch the total member count for that team
        const teamsData = await Promise.all(memberships.map(async (mem) => {
            const team = mem.team;
            const memberCount = await teamMembership_model_1.TeamMembership.countDocuments({
                team: team._id,
            });
            // 3. Return the rich object
            return {
                team: team,
                role: mem.role,
                memberCount: memberCount,
            };
        }));
        res.status(200).json(teamsData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getMyTeams = getMyTeams;
//# sourceMappingURL=team.controller.js.map