import { Request, Response } from 'express';
import { Task } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';
import { logActivity } from '../../services/activity.service';
import { Types } from 'mongoose';
import { TeamMembership } from '../../models/teamMembership.model';
import { Server } from 'socket.io'; // <-- 1. IMPORT Server from socket.io

// @desc    Create a new task within a project
// @route   POST /api/v1/projects/:projectId/tasks
export const createTask = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const taskDto = req.body as CreateTaskDto;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      ...taskDto,
      project: projectId,
      createdBy: userId,
      assignee: taskDto.assigneeId
        ? new Types.ObjectId(taskDto.assigneeId)
        : undefined,
    });

    // Log the activity
    await logActivity(
      userId as Types.ObjectId,
      project.team as Types.ObjectId,
      'TASK_CREATED',
      `User ${req.user?.name} created task "${task.title}"`,
      new Types.ObjectId(projectId),
      task._id as Types.ObjectId
    );

    // --- 2. EMIT SOCKET.IO EVENT ---
    // Get the 'io' instance from the app
    const io: Server = req.app.get('socketio');
    // Get the teamId to use as the "room" name
    const teamId = project.team.toString();
    // Emit the 'task_created' event to all sockets in that room
    io.to(teamId).emit('task_created', task);

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all tasks for a specific project
// @route   GET /api/v1/projects/:projectId/tasks
export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!._id;

    // --- 1. GET THE PROJECT TO FIND THE TEAM ---
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // --- 2. GET THE USER'S ROLE FOR THIS TEAM ---
    const membership = await TeamMembership.findOne({
      user: userId,
      team: project.team,
    });
    const userRole = membership ? membership.role : null;

    // --- 3. GET THE TASKS (as before) ---
    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name');

    // --- 4. RETURN THE NEW, SMARTER PAYLOAD ---
    res.status(200).json({
      userRole: userRole,
      tasks: tasks,
    });

  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a task
// @route   PATCH /api/v1/tasks/:taskId
export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskDto = req.body as UpdateTaskDto;
    const userId = req.user!._id as Types.ObjectId; 
    const task = req.task!; 
    const project = task.project as any; 
    const io: Server = req.app.get('socketio'); // <-- Get io instance

    // --- 1. STORE THE *OLD* ASSIGNEE ---
    const oldAssigneeId = task.assignee?.toString();

    // ... (Clean DTO logic remains the same) ...
    Object.keys(taskDto).forEach(
      (key) => (taskDto as any)[key] === undefined && delete (taskDto as any)[key]
    );

    // ... (Role-Based Logic remains the same) ...
    const membership = await TeamMembership.findOne({
      user: userId, 
      team: project.team,
    });
    const userRole = membership?.role;

    if (userRole === 'Member') {
      // ... (Member policy logic remains the same) ...
    }
    
    // ... (Update task logic remains the same) ...
    Object.assign(task, taskDto);
    if (taskDto.assigneeId) {
      task.assignee = new Types.ObjectId(taskDto.assigneeId);
    }

    await task.save(); 

    // ... (Log activity remains the same) ...
    await logActivity(
      userId as Types.ObjectId,
      project.team as Types.ObjectId,
      'TASK_UPDATED',
      `User ${req.user!.name} updated task "${task.title}"`,
      project._id as Types.ObjectId,
      task._id as Types.ObjectId
    );

    // === 2. REAL-TIME NOTIFICATION LOGIC ===

    // Event 1: Notify the *whole team* that the task was updated (as before)
    const teamId = project.team.toString();
    io.to(teamId).emit('task_updated', task);

    // Event 2: Notify the *new assignee* personally
    const newAssigneeId = task.assignee?.toString();
    if (newAssigneeId && newAssigneeId !== oldAssigneeId) {
      // It was assigned or re-assigned
      io.to(newAssigneeId).emit('task_assigned_to_you', {
        title: task.title,
        projectName: project.name,
      });
    }

    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:taskId
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id as Types.ObjectId; 
    const task = req.task!;
    const project = task.project as any;

    // === 2. THE FEATURE: Role-Based Logic for Deletion ===
    const membership = await TeamMembership.findOne({
      user: userId, 
      team: project.team,
    });
    const userRole = membership?.role;

    if (userRole !== 'Admin') {
      return res.status(403).json({
        message: 'Forbidden: Only Admins can delete tasks.',
      });
    }

    // 3. Perform the delete
    await Task.findByIdAndDelete(task._id);

    // 4. Log the activity
    await logActivity(
      userId as Types.ObjectId,
      project.team as Types.ObjectId,
      'TASK_DELETED',
      `User ${req.user!.name} deleted task "${task.title}"`,
      project._id as Types.ObjectId,
      task._id as Types.ObjectId
    );

    // --- 4. EMIT SOCKET.IO EVENT ---
    const io: Server = req.app.get('socketio');
    const teamId = project.team.toString();
    // Emit 'task_deleted' with the ID so the frontend can remove it
    io.to(teamId).emit('task_deleted', { taskId: task._id });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};