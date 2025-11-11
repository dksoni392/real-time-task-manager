import { Request, Response } from 'express';
import { User, UserRole } from '../../models/user.model';
import generateToken from '../../utils/generateToken';
import { RegisterUserDto, LoginUserDto } from '../dtos/auth.dto';
import { Types } from 'mongoose'; // <-- Import Types for the assertion


// @desc    Register a new user
// @route   POST /api/v1/auth/register
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, masterKey } = req.body as RegisterUserDto;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // === 2. MASTER KEY LOGIC ===
    let userRole = UserRole.Member; // Default role

    if (masterKey) {
      if (masterKey === process.env.MASTER_KEY) {
        userRole = UserRole.Admin; // Elevate to Super Admin
      } else {
        // They provided a key, but it was wrong.
        return res.status(403).json({ message: 'Invalid Master Key' });
      }
    }
    // === END OF LOGIC ===

    // 3. Create new user with the determined role
    const user = await User.create({
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
        userResponse
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/v1/auth/login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginUserDto;

    // 1. Find user by email
    const user = await User.findOne({ email }).select('+password');

    // 2. Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      // We don't want to send back the password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(200).json({
        ...userResponse,
        // === THE FIX ===
        // We assert the type because we know user._id is valid here
        token: generateToken(user._id as Types.ObjectId),
      });
    } else {
      // Use a generic message for security
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};