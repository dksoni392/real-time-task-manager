import { Activity } from '../models/activity.model';
import { Types } from 'mongoose';

// A simple service to log actions
export const logActivity = async (
  userId: Types.ObjectId,
  teamId: Types.ObjectId,
  action: string,
  details: string,
  projectId?: Types.ObjectId,
  taskId?: Types.ObjectId
) => {
  try {
    await Activity.create({
      user: userId,
      team: teamId,
      action,
      details,
      project: projectId,
      task: taskId,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // We don't throw an error, as logging is a non-critical side-effect
  }
};