import { Request, Response, NextFunction } from 'express';
import { TeamRole } from '../../models/teamMembership.model';
export declare const checkTeamRole: (allowedRoles: TeamRole[]) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const checkProjectAccess: (allowedRoles: TeamRole[]) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const checkTaskAccess: (allowedRoles: TeamRole[]) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=rbac.middleware.d.ts.map