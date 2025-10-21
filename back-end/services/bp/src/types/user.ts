import { Document } from "mongoose";

// User types
export interface IUser extends Document {
  googleId?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  image?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
