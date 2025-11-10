import { Document, Types } from 'mongoose';
export interface IProject extends Document {
    name: string;
    description?: string;
    team: Types.ObjectId;
}
export declare const Project: import("mongoose").Model<IProject, {}, {}, {}, Document<unknown, {}, IProject, {}, {}> & IProject & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=project.model.d.ts.map