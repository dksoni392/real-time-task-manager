import { Document } from 'mongoose';
export interface ITeam extends Document {
    name: string;
    description?: string;
}
export declare const Team: import("mongoose").Model<ITeam, {}, {}, {}, Document<unknown, {}, ITeam, {}, {}> & ITeam & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=team.model.d.ts.map