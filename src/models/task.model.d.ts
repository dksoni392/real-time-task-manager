import { Document, Types } from 'mongoose';
export declare enum TaskStatus {
    ToDo = "To Do",
    InProgress = "In Progress",
    Review = "Review",
    Done = "Done"
}
export declare enum TaskPriority {
    Low = "Low",
    Medium = "Medium",
    High = "High"
}
export interface ITask extends Document {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date;
    project: Types.ObjectId;
    assignee?: Types.ObjectId;
    createdBy: Types.ObjectId;
}
export declare const Task: import("mongoose").Model<ITask, {}, {}, {}, Document<unknown, {}, ITask, {}, {}> & ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=task.model.d.ts.map