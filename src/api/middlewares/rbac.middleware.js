"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTaskAccess = exports.checkProjectAccess = exports.checkTeamRole = void 0;
const teamMembership_model_1 = require("../../models/teamMembership.model");
const project_model_1 = require("../../models/project.model");
const task_model_1 = require("../../models/task.model"); // <-- 1. IMPORT THE TASK MODEL
// src/api/middlewares/rbac.middleware.ts
// ... (imports) ...
// This middleware factory checks role based on 'teamId' in URL params
const checkTeamRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?._id;
            const { teamId } = req.params;
            if (!userId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            // === 1. SUPER ADMIN BYPASS ===
            if (req.user?.role === 'Admin') {
                return next(); // This is a Super Admin, let them pass
            }
            // === END BYPASS ===
            // User is a 'Member', check their team role
            const membership = await teamMembership_model_1.TeamMembership.findOne({
                user: userId,
                team: teamId,
                role: { $in: allowedRoles },
            });
            if (!membership) {
                return res.status(403).json({
                    message: "Forbidden: You don't have the required role for this team",
                });
            }
            next();
        }
        catch (error) {
            res.status(500).json({ message: 'Server error in RBAC middleware' });
        }
    };
};
exports.checkTeamRole = checkTeamRole;
// This middleware factory checks role based on 'projectId' in URL params
const checkProjectAccess = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?._id;
            const { projectId } = req.params;
            if (!userId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            // === 2. SUPER ADMIN BYPASS ===
            if (req.user?.role === 'Admin') {
                return next(); // This is a Super Admin, let them pass
            }
            // === END BYPASS ===
            // ... (rest of the logic is unchanged) ...
            const project = await project_model_1.Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
            const teamId = project.team;
            const membership = await teamMembership_model_1.TeamMembership.findOne({
                user: userId,
                team: teamId,
                role: { $in: allowedRoles },
            });
            if (!membership) {
                return res.status(403).json({
                    message: "Forbidden: You don't have access to the team this project belongs to",
                });
            }
            next();
        }
        catch (error) {
            res.status(500).json({ message: 'Server error in RBAC middleware' });
        }
    };
};
exports.checkProjectAccess = checkProjectAccess;
// This middleware factory checks role based on 'taskId' in URL params
const checkTaskAccess = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?._id;
            const { taskId } = req.params;
            if (!userId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            // === 3. SUPER ADMIN BYPASS ===
            if (req.user?.role === 'Admin') {
                // We still need to find the task and attach it for the controller
                const task = await task_model_1.Task.findById(taskId).populate('project');
                if (!task) {
                    return res.status(404).json({ message: 'Task not found' });
                }
                req.task = task;
                return next(); // This is a Super Admin, let them pass
            }
            // === END BYPASS ===
            // ... (rest of the logic is unchanged) ...
            const task = await task_model_1.Task.findById(taskId).populate('project');
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }
            const project = task.project;
            if (!project) {
                return res.status(404).json({ message: 'Project not found for this task' });
            }
            const teamId = project.team;
            const membership = await teamMembership_model_1.TeamMembership.findOne({
                user: userId,
                team: teamId,
                role: { $in: allowedRoles },
            });
            if (!membership) {
                return res.status(403).json({
                    message: "Forbidden: You don't have access to the team this task belongs to",
                });
            }
            req.task = task;
            next();
        }
        catch (error) {
            res
                .status(500)
                .json({ message: 'Server error in Task RBAC middleware', error: error.message });
        }
    };
};
exports.checkTaskAccess = checkTaskAccess;
//# sourceMappingURL=rbac.middleware.js.map