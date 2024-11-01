import passport from 'passport';
import dotenv, { config } from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

dotenv.config();

console.log(process.env.GOOGLE_CLIENT_ID)
console.log(process.env.GOOGLE_CLIENT_SECRET)

passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://event-management-system-backend-00sp.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile);
  
        // Check if a user with the given email already exists
        let user = await User.findOne({ email: profile.emails[0].value });
  
        if (user) {
          console.log("User exists:", user); // Log existing user info
          return done(null, user); // Log the user in if they already exist
        }
  
        // If user does not exist, create a new one
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        });
        console.log("New user created:", user); // Log new user creation
        done(null, user);
      } catch (error) {
        console.error("Error in Google OAuth strategy:", error); // Log errors in detail
        done(error, null);
      }
    }
  ));



passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
