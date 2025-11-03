import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const generateToken = (userId: Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: '30d', // Stays logged in for 30 days
  });
};

export default generateToken;