import { Schema, model, Document, Types } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  team: Types.ObjectId; // A project belongs to one team
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team', // Link to the Team model
      required: true,
      index: true, // Good to index foreign keys for faster lookups
    },
  },
  {
    timestamps: true,
  }
);

export const Project = model<IProject>('Project', ProjectSchema);