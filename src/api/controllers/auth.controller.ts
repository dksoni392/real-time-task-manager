import { Request, Response } from 'express';
import { User } from '../../models/user.model';
import generateToken from '../../utils/generateToken';
import { RegisterUserDto, LoginUserDto } from '../dtos/auth.dto';
import { Types } from 'mongoose'; // <-- Import Types for the assertion

// @desc    Register a new user
// @route   POST /api/v1/auth/register
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as RegisterUserDto;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Create new user
    // The 'pre-save' hook in your model will hash the password
    const user = await User.create({
      name,
      email,
      password,
    });

    // 3. Respond with user data and token
    if (user) {
      // We don't want to send back the password, even hashed
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        ...userResponse,
        // === THE FIX ===
        // We assert the type because we know user._id is valid here
        token: generateToken(user._id as Types.ObjectId),
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