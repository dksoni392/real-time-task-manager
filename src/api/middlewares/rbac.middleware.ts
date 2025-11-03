import { Request, Response, NextFunction } from 'express';
import {
  TeamMembership,
  TeamRole,
} from '../../models/teamMembership.model';
import { Project } from '../../models/project.model';

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