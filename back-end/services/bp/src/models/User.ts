// Description: Mongoose schema for User (supports Google OAuth and Local email/password).

import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs"; // For password hashing

export interface IUser extends Document {
  googleId?: string; // Optional for local users
  displayName: string;
  firstName?: string; // Optional, might not be available for local registration initially
  lastName?: string; // Optional
  email?: string; // Used as username for local auth, can also be from Google
  password?: string; // For local authentication
  image?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents to have null/missing googleId
  },
  displayName: {
    // For local accounts, this could be a username or derived from email
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    // Email will be the username for local strategy
    type: String,
    required: function (this: IUser) {
      return !this.googleId;
    }, // Required if not a Google user
    unique: true,
    sparse: true, // Allows multiple documents to have null/missing email if googleId is present (though email is usually always present)
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  password: {
    type: String,
    required: function (this: IUser) {
      return !this.googleId;
    }, // Required if not a Google user
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash password for local users
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Method to compare candidate password with stored hashed password
UserSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
