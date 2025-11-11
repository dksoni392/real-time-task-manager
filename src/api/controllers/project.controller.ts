import { Request, Response } from 'express';
import { Project } from '../../models/project.model';
import { CreateProjectDto } from '../dtos/project.dto';
import { logActivity } from '../../services/activity.service';
import { Types } from 'mongoose';
import { Server } from 'socket.io'; // <-- 1. IMPORT Server from socket.io
import { TeamMembership } from '../../models/teamMembership.model'; // <-- Make sure this is imported
import { Task } from '../../models/task.model';

// @desc    Create a new project within a team
// @route   POST /api/v1/teams/:teamId/projects
export const createProject = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body as CreateProjectDto;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Our checkTeamRole RBAC middleware has already confirmed
    // this user is an Admin of this team. We can proceed.

    const project = await Project.create({
      name,
      description,
      team: teamId,
    });

    // Log the activity
    await logActivity(
      userId as Types.ObjectId,
      new Types.ObjectId(teamId),
      'PROJECT_CREATED',
      `User ${req.user?.name} created project "${name}"`,
      project._id as Types.ObjectId
    );

    // --- 2. EMIT SOCKET.IO EVENT ---
    const io: Server = req.app.get('socketio');
    const teamIdString = project.team.toString();
    // Emit to everyone in the team room
    io.to(teamIdString).emit('project_created', project);

    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all projects for a specific team
// @route   GET /api/v1/teams/:teamId/projects
export const getProjectsByTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user!._id;

    // --- 1. CHECK FOR SUPER ADMIN FIRST ---
    let userRole = null;
    if (req.user!.role === 'Admin') {
      userRole = 'Admin';
    } else {
      // --- 2. IF NOT SUPER ADMIN, FIND TEAM ROLE ---
      const membership = await TeamMembership.findOne({
        user: userId,
        team: teamId,
      });
      userRole = membership ? membership.role : null; // e.g., 'Admin' or 'Member'
    }

    // 3. Get the projects (as before)
    const projects = await Project.find({ team: teamId });
    
    // 4. Return the new, smarter payload (an OBJECT, not an array)
    res.status(200).json({
      userRole: userRole,
      projects: projects,
    });
    
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a project (Admin Only)
// @route   DELETE /api/v1/projects/:projectId
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    // 1. Find the project to get the teamId for the socket event
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const teamId = project.team.toString();

    // 2. Delete all tasks associated with the project
    await Task.deleteMany({ project: projectId });

    // 3. Delete the project itself
    await Project.findByIdAndDelete(projectId);

    // 4. Emit a real-time event to the team room
    const io: Server = req.app.get('socketio');
    io.to(teamId).emit('project_deleted', { projectId: projectId, teamId: teamId });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};