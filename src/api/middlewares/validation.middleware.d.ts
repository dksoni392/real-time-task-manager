import { Request, Response, NextFunction } from 'express';
import { ClassConstructor } from 'class-transformer';
export declare const validationMiddleware: <T extends object>(dtoClass: ClassConstructor<T>) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=validation.middleware.d.ts.map