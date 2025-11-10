"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const teamMembership_model_1 = require("../models/teamMembership.model");
// This function sets up all Socket.IO logic
const setupSocket = (io) => {
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
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            // Find the user
            const user = await user_model_1.User.findById(decoded.id);
            if (!user) {
                return next(new Error('Authentication error: User not found.'));
            }
            // Attach user to the socket object for use in other events
            socket.user = user;
            next();
        }
        catch (error) {
            // Use 'any' for the error type in a catch block
            next(new Error(`Authentication error: ${error.message}`));
        }
    });
    // === 2. Main Connection Event (No changes) ===
    // This runs AFTER the authentication middleware succeeds
    io.on('connection', async (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        const user = socket.user;
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
            const memberships = await teamMembership_model_1.TeamMembership.find({ user: user._id });
            memberships.forEach(membership => {
                const teamId = membership.team.toString();
                console.log(`Socket ${socket.id} joining team room: ${teamId}`);
                socket.join(teamId);
            });
        }
        catch (error) {
            console.error(`Error joining rooms for socket ${socket.id}:`, error);
        }
        // --- Handle Disconnection (No changes) ---
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};
exports.setupSocket = setupSocket;
//# sourceMappingURL=socketHandler.js.map