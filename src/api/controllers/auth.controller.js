"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const user_model_1 = require("../../models/user.model");
const generateToken_1 = __importDefault(require("../../utils/generateToken"));
// @desc    Register a new user
// @route   POST /api/v1/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, masterKey } = req.body;
        // 1. Check if user already exists
        const userExists = await user_model_1.User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // === 2. MASTER KEY LOGIC ===
        let userRole = user_model_1.UserRole.Member; // Default role
        if (masterKey) {
            if (masterKey === process.env.MASTER_KEY) {
                userRole = user_model_1.UserRole.Admin; // Elevate to Super Admin
            }
            else {
                // They provided a key, but it was wrong.
                return res.status(403).json({ message: 'Invalid Master Key' });
            }
        }
        // === END OF LOGIC ===
        // 3. Create new user with the determined role
        const user = await user_model_1.User.create({
            name,
            email,
            password,
            role: userRole, // <-- Assign the role
        });
        // 4. Respond with user data and token
        if (user) {
            const userResponse = user.toObject();
            delete userResponse.password;
            res.status(201).json({
                ...userResponse,
                token: (0, generateToken_1.default)(user._id),
            });
        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.registerUser = registerUser;
// @desc    Authenticate user & get token (Login)
// @route   POST /api/v1/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Find user by email
        const user = await user_model_1.User.findOne({ email }).select('+password');
        // 2. Check if user exists and password matches
        if (user && (await user.comparePassword(password))) {
            // We don't want to send back the password
            const userResponse = user.toObject();
            delete userResponse.password;
            res.status(200).json({
                ...userResponse,
                // === THE FIX ===
                // We assert the type because we know user._id is valid here
                token: (0, generateToken_1.default)(user._id),
            });
        }
        else {
            // Use a generic message for security
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=auth.controller.js.map