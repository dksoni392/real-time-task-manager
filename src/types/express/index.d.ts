// We are extending the existing Express 'Request' interface
// to include our custom 'user' property.

import { IUser } from '../../models/user.model'; // Adjust path as needed
import { ITask } from '../../models/task.model'; // <-- 1. IMPORT THIS

declare global {
  namespace Express {
    export interface Request {
      user?: IUser; // 'user' will be attached by our auth middleware
      task?: ITask;
    }
  }
}