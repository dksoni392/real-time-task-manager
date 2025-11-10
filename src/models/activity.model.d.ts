import { Document, Types } from 'mongoose';
export interface IActivity extends Document {
    user: Types.ObjectId;
    action: string;
    details: string;
    team: Types.ObjectId;
    project?: Types.ObjectId;
    task?: Types.ObjectId;
}
export declare const Activity: import("mongoose").Model<IActivity, {}, {}, {}, Document<unknown, {}, IActivity, {}, {}> & IActivity & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=activity.model.d.ts.map