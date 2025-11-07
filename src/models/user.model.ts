import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Define the UserRole enum
export enum UserRole {
  Admin = 'Admin',
  Member = 'Member',
}

// 2. Update the IUser interface
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole; // This is the 'userType' field
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Hides the password from default queries
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Member,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Mongoose "pre-save" hook: Runs before a document is saved
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// === 3. THIS IS THE FIX ===
// We MUST use the 'function' keyword here to get the correct 'this' context.
// An arrow function () => {} would FAIL and cause your exact error.

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // 'this' refers to the specific user document
  // We must explicitly cast 'this' to get type safety
  const user = this as IUser; 
  
  if (!user.password) {
    // This can happen if the query didn't .select('+password')
    return false;
  }
  
  return bcrypt.compare(candidatePassword, user.password);
};

export const User = model<IUser>('User', UserSchema);