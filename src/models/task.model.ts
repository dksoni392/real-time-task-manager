import { Schema, model, Document, Types } from 'mongoose';

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Review = 'Review',
  Done = 'Done',
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  project: Types.ObjectId; // Belongs to one project
  assignee?: Types.ObjectId; // Optional: may not be assigned
  createdBy: Types.ObjectId;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.ToDo,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.Medium,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // A task might be unassigned
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITask>('Task', TaskSchema);