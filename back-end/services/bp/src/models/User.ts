// Description: Mongoose schema for User (primarily for Google OAuth).

import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  googleId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  image: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUser>("User", UserSchema);
