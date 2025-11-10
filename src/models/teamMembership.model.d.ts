import { Document, Types } from 'mongoose';
export declare enum TeamRole {
    Admin = "Admin",
    Member = "Member"
}
export interface ITeamMembership extends Document {
    user: Types.ObjectId;
    team: Types.ObjectId;
    role: TeamRole;
}
export declare const TeamMembership: import("mongoose").Model<ITeamMembership, {}, {}, {}, Document<unknown, {}, ITeamMembership, {}, {}> & ITeamMembership & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=teamMembership.model.d.ts.map