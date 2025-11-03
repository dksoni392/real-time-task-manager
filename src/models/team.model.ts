import { Schema, model, Document, Types } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description?: string;
}

const TeamSchema = new Schema<ITeam>(
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
  },
  {
    timestamps: true,
  }
);

export const Team = model<ITeam>('Team', TeamSchema);