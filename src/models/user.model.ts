import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional on the interface, but required for creation
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
      unique: true, // No two users can have the same email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // **CRITICAL**: Hides the password from default queries
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Mongoose "pre-save" hook: Runs before a document is saved
UserSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to compare candidate password with the stored hash
UserSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  // this.password is not available here because of `select: false`
  // We must query for it specifically when logging in.
  // This method is usually called on a user doc retrieved with .select('+password')
  if (!this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>('User', UserSchema);