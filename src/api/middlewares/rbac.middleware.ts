import { Request, Response, NextFunction } from 'express';
import {
  TeamMembership,
  TeamRole,
} from '../../models/teamMembership.model';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model'; // <-- 1. IMPORT THE TASK MODEL

// This middleware factory checks role based on 'teamId' in URL params
export const checkTeamRole = (allowedRoles: TeamRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { teamId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // Check if user is a member of the team with one of the allowed roles
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

      // User has the required role, proceed
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error in RBAC middleware' });
    }
  };
};

// This middleware factory checks role based on 'projectId' in URL params
// It's more complex as it must first find the project to get the teamId
export const checkProjectAccess = (allowedRoles: TeamRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { projectId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // 1. Find the project
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // 2. Get the teamId from the project
      const teamId = project.team;

      // 3. Check membership for that team
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

      // User is authorized, proceed
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error in RBAC middleware' });
    }
  };
};

// === 2. THIS IS THE FUNCTION THAT WAS MISSING ===

/**
 * Checks if a user has access to a specific task.
 * It finds the task, its project, and its team, then
 * checks the user's role on that team.
 *
 * If successful, it attaches the found `task` to `req.task`.
 */
export const checkTaskAccess = (allowedRoles: TeamRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { taskId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // 1. Find the task and populate its project
      const task = await Task.findById(taskId).populate('project');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // 2. The project object is nested, so we must cast it
      const project = task.project as any;
      if (!project) {
        return res.status(404).json({ message: 'Project not found for this task' });
      }

      // 3. Get the teamId from the project
      const teamId = project.team;

      // 4. Check membership for that team
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

      // 5. SUCCESS! Attach the task to the request
      req.task = task;
      next();
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Server error in Task RBAC middleware', error: error.message });
    }
  };
};