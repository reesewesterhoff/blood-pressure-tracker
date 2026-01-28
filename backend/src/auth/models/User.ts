// Description: Mongoose schema for User (supports Google OAuth and Local email/password).

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs"; // For password hashing
import { IUser } from "../../shared/types";

const UserSchema: Schema = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents to have null/missing googleId
    },
    firstName: {
      type: String,
      required: true,
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
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

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

export const User = mongoose.model<IUser>("User", UserSchema);
