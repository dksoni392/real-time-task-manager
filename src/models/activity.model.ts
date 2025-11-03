import { Schema, model, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  user: Types.ObjectId; // Who performed the action
  action: string; // e.g., "TASK_CREATED", "USER_JOINED_TEAM"
  details: string; // e.g., "User created task 'Build the API'"
  team: Types.ObjectId; // The team context
  project?: Types.ObjectId; // Optional: if action is project-related
  task?: Types.ObjectId; // Optional: if action is task-related
}

const ActivitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Activity = model<IActivity>('Activity', ActivitySchema);