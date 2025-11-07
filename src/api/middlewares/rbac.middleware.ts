import { Request, Response, NextFunction } from 'express';
import {
  TeamMembership,
  TeamRole,
} from '../../models/teamMembership.model';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model'; // <-- 1. IMPORT THE TASK MODEL

// src/api/middlewares/rbac.middleware.ts

// ... (imports) ...

// This middleware factory checks role based on 'teamId' in URL params
export const checkTeamRole = (allowedRoles: TeamRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
      const membership = await TeamMembership.findOne({
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
    } catch (error) {
      res.status(500).json({ message: 'Server error in RBAC middleware' });
    }
  };
};

// This middleware factory checks role based on 'projectId' in URL params
export const checkProjectAccess = (allowedRoles: TeamRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      const teamId = project.team;
      const membership = await TeamMembership.findOne({
        user: userId,
        team: teamId,
        role: { $in: allowedRoles },
      });
      if (!membership) {
        return res.status(403).json({
          message:
            "Forbidden: You don't have access to the team this project belongs to",
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error in RBAC middleware' });
    }
  };
};

// This middleware factory checks role based on 'taskId' in URL params
export const checkTaskAccess = (allowedRoles: TeamRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { taskId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // === 3. SUPER ADMIN BYPASS ===
      if (req.user?.role === 'Admin') {
        // We still need to find the task and attach it for the controller
        const task = await Task.findById(taskId).populate('project');
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }
        req.task = task;
        return next(); // This is a Super Admin, let them pass
      }
      // === END BYPASS ===

      // ... (rest of the logic is unchanged) ...
      const task = await Task.findById(taskId).populate('project');
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      const project = task.project as any;
      if (!project) {
        return res.status(404).json({ message: 'Project not found for this task' });
      }
      const teamId = project.team;
      const membership = await TeamMembership.findOne({
        user: userId,
        team: teamId,
        role: { $in: allowedRoles },
      });
      if (!membership) {
        return res.status(403).json({
          message:
            "Forbidden: You don't have access to the team this task belongs to",
        });
      }
      req.task = task;
      next();
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Server error in Task RBAC middleware', error: error.message });
    }
  };
};