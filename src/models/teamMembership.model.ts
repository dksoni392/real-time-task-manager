import { Schema, model, Document, Types } from 'mongoose';

export enum TeamRole {
  Admin = 'Admin',
  Member = 'Member',
}

export interface ITeamMembership extends Document {
  user: Types.ObjectId;
  team: Types.ObjectId;
  role: TeamRole;
}

const TeamMembershipSchema = new Schema<ITeamMembership>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Establishes the link to the User model
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team', // Establishes the link to the Team model
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(TeamRole), // Use the enum values
      default: TeamRole.Member,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a compound index to prevent a user from being on the same team twice
TeamMembershipSchema.index({ user: 1, team: 1 }, { unique: true });

export const TeamMembership = model<ITeamMembership>(
  'TeamMembership',
  TeamMembershipSchema
);