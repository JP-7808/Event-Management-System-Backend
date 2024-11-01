import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

dotenv.config();

passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://event-management-system-backend-00sp.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log("Google Access Token:", accessToken); // Log access token
        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          if (!user) {
            // Create a new user if not found
            user = await new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              password: null // No password needed for Google auth
            }).save();
          }
          done(null, user);
        } catch (error) {
          console.error("Error during authentication:", error); // Log error
          done(error, null);
        }
      }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
