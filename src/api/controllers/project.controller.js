"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsByTeam = exports.createProject = void 0;
const project_model_1 = require("../../models/project.model");
const activity_service_1 = require("../../services/activity.service");
const mongoose_1 = require("mongoose");
const teamMembership_model_1 = require("../../models/teamMembership.model"); // <-- Make sure this is imported
// @desc    Create a new project within a team
// @route   POST /api/v1/teams/:teamId/projects
const createProject = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name, description } = req.body;
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Our checkTeamRole RBAC middleware has already confirmed
        // this user is an Admin of this team. We can proceed.
        const project = await project_model_1.Project.create({
            name,
            description,
            team: teamId,
        });
        // Log the activity
        await (0, activity_service_1.logActivity)(userId, new mongoose_1.Types.ObjectId(teamId), 'PROJECT_CREATED', `User ${req.user?.name} created project "${name}"`, project._id);
        // --- 2. EMIT SOCKET.IO EVENT ---
        const io = req.app.get('socketio');
        const teamIdString = project.team.toString();
        // Emit to everyone in the team room
        io.to(teamIdString).emit('project_created', project);
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createProject = createProject;
// @desc    Get all projects for a specific team
// @route   GET /api/v1/teams/:teamId/projects
const getProjectsByTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;
        // --- 1. CHECK FOR SUPER ADMIN FIRST ---
        let userRole = null;
        if (req.user.role === 'Admin') {
            userRole = 'Admin';
        }
        else {
            // --- 2. IF NOT SUPER ADMIN, FIND TEAM ROLE ---
            const membership = await teamMembership_model_1.TeamMembership.findOne({
                user: userId,
                team: teamId,
            });
            userRole = membership ? membership.role : null; // e.g., 'Admin' or 'Member'
        }
        // 3. Get the projects (as before)
        const projects = await project_model_1.Project.find({ team: teamId });
        // 4. Return the new, smarter payload (an OBJECT, not an array)
        res.status(200).json({
            userRole: userRole,
            projects: projects,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getProjectsByTeam = getProjectsByTeam;
//# sourceMappingURL=project.controller.js.map