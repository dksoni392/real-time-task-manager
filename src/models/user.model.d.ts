import { Document } from 'mongoose';
export declare enum UserRole {
    Admin = "Admin",
    Member = "Member"
}
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=user.model.d.ts.map