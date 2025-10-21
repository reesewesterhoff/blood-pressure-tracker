// Description: Passport.js: Google OAuth and Local (email/password) Strategy Configuration.

import passportInstance from "passport";
import { Strategy as GoogleStrategyPassport } from "passport-google-oauth20";
import { Strategy as LocalStrategyPassport } from "passport-local"; // For email/password
import { User } from "../models/User";
import { IUser } from "../types";

export function configurePassport() {
  // Local Strategy (email/password)
  passportInstance.use(
    new LocalStrategyPassport(
      { usernameField: "email" }, // We are using email as the username
      async (email, password, done) => {
        try {
          const lowercasedEmail = email.toLowerCase();
          const user = await User.findOne({ email: lowercasedEmail });
          if (!user) {
            return done(null, false, {
              message: "Incorrect email or password.",
            });
          }
          if (!user.password) {
            // User might exist via Google OAuth but has no local password
            return done(null, false, {
              message:
                "Account exists with Google. Try logging in with Google or set a password.",
            });
          }

          const isMatch = await user.comparePassword(password);
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, {
              message: "Incorrect email or password.",
            });
          }
        } catch (err) {
          console.error("Error in LocalStrategy:", err);
          return done(err);
        }
      }
    )
  );

  // Google OAuth Strategy
  passportInstance.use(
    new GoogleStrategyPassport(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/auth/google/callback",
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        const googleEmail =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value.toLowerCase()
            : undefined;

        const newUser = {
          googleId: profile.id,
          displayName:
            profile.displayName ||
            `${profile.name?.givenName} ${profile.name?.familyName}`.trim() ||
            googleEmail ||
            "User",
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          image: profile.photos?.[0].value,
          email: googleEmail, // Store email from Google
        };

        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            // User found with this Google ID
            // Optionally update user details from Google profile if they changed
            user.displayName = newUser.displayName;
            user.image = newUser.image || user.image;
            if (newUser.email && !user.email) user.email = newUser.email; // Add email if missing
            await user.save();
            return done(null, user);
          }

          // No user with this Google ID, check if email from Google already exists (local account)
          if (googleEmail) {
            user = await User.findOne({ email: googleEmail });
            if (user) {
              // Email exists (likely local account or different Google account linked previously)
              // Link Google ID to this existing account
              user.googleId = profile.id;
              user.displayName = newUser.displayName || user.displayName; // Prefer Google's display name
              user.image = newUser.image || user.image;
              // Ensure other Google details are updated if preferred
              user.firstName = newUser.firstName || user.firstName;
              user.lastName = newUser.lastName || user.lastName;
              await user.save();
              return done(null, user);
            }
          }

          // If no existing user by googleId or email, create a new one
          user = await User.create(newUser);
          return done(null, user);
        } catch (err: any) {
          console.error("Error in GoogleStrategy:", err);
          if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            // Duplicate email error, this case should ideally be handled by the email check above
            // but as a fallback:
            return done(null, false, {
              message:
                "An account with this email already exists. Try logging in with your password or a different Google account.",
            } as any);
          }
          return done(err, undefined);
        }
      }
    )
  );

  passportInstance.serializeUser((user: any, done) => {
    // user can be IUser
    done(null, user.id);
  });

  passportInstance.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user as IUser | null); // Cast user to IUser or null
    } catch (err) {
      done(err, null);
    }
  });
}
