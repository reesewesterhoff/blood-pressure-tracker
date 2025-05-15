// Description: Passport.js Google OAuth Strategy Configuration.
// This is a simplified setup. You'll need to install passport, passport-google-oauth20.

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User, { IUser } from "../models/User"; // Your User model

export function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!, // Get from Google Cloud Console
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Get from Google Cloud Console
        callbackURL: "/auth/google/callback", // Matches your authRoutes
        proxy: true, // If running behind a proxy like Heroku
      },
      async (accessToken, refreshToken, profile, done) => {
        // This callback is called after Google authenticates the user
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          image: profile.photos?.[0].value || "",
        };

        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            done(null, user); // User found, log them in
          } else {
            user = await User.create(newUser); // New user, create and log in
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, undefined);
        }
      }
    )
  );

  // Serializes user instance to the session
  passport.serializeUser((user: any, done) => {
    done(null, user.id); // user.id is the _id from MongoDB
  });

  // Deserializes user instance from the session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}
