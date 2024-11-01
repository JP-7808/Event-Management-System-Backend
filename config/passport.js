import passport from 'passport';
import dotenv, { config } from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

dotenv.config();

// Check if the Google client ID is available
if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("Error: GOOGLE_CLIENT_ID is not set in the environment variables.");
} else {
    console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);  // Print Google Client ID for checking
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://event-management-system-backend-00sp.onrender.com/auth/google/callback",
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
            return done(null, existingUser);
        }

        const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
        });

        done(null, newUser);
    } catch (error) {
        done(error, null);
    }
}));

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
