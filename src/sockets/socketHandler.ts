import { Server, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/user.model';
import { TeamMembership } from '../models/teamMembership.model';
import { Types } from 'mongoose';

// Our custom payload interface
interface CustomJwtPayload extends JwtPayload {
  id: string;
}

// This function sets up all Socket.IO logic
export const setupSocket = (io: Server) => {
  
  // === 1. Socket.IO Authentication Middleware (UPDATED) ===
  io.use(async (socket, next) => {
    try {
      // === THIS IS THE FIX ===
      // We will look for the token in two places:
      // 1. In the 'auth' object (for modern clients)
      // 2. In the 'query' parameters (for your version of Postman)
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      // === END OF FIX ===
      
      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication error: No token provided.'));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error('Server error: JWT_SECRET not set.'));
      }

      // Verify the token
      const decoded = jwt.verify(token, secret) as CustomJwtPayload;
      
      // Find the user
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }

      // Attach user to the socket object for use in other events
      (socket as any).user = user;
      next();

    } catch (error: any) {
      // Use 'any' for the error type in a catch block
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  // === 2. Main Connection Event (No changes) ===
  // This runs AFTER the authentication middleware succeeds
  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    const user = (socket as any).user;

    if (!user) {
      console.log('Socket connection failed: User not found after auth.');
      return socket.disconnect();
    }
    
    // === 3. Join Rooms ===
    
    // --- THIS IS THE NEWLY ADDED LINE ---
    // Join a "personal" room, e.g., '690b0f803941f2c8142924eb'
    // This allows us to send direct, personal notifications (like an invite).
    socket.join(user._id.toString());
    
    // Join all team rooms
    try {
      const memberships = await TeamMembership.find({ user: user._id });
      
      memberships.forEach(membership => {
        const teamId = membership.team.toString();
        console.log(`Socket ${socket.id} joining team room: ${teamId}`);
        socket.join(teamId);
      });
      
    } catch (error) {
      console.error(`Error joining rooms for socket ${socket.id}:`, error);
    }
    
    // --- Handle Disconnection (No changes) ---
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });

  });
};