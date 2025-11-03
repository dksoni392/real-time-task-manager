import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../../models/user.model';

// This is our custom payload interface
interface CustomJwtPayload extends JwtPayload {
  id: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(' ')[1];

      // 2. === THE FIX ===
      // We must check if the token actually exists after splitting
      if (!token) {
        return res
          .status(401)
          .json({ message: 'Not authorized, token malformed' });
      }
      // ==================

      // 3. Verify token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }

      // At this point, TypeScript *knows* 'token' is a string, so 'verify' is happy.
      const decoded = jwt.verify(token, secret) as CustomJwtPayload;

      // 4. Get user from DB and attach to req object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res
          .status(401)
          .json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token was found in the header at all
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};