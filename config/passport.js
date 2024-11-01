import passport from 'passport';
import dotenv, { config } from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

dotenv.config();

console.log(process.env.GOOGLE_CLIENT_ID)
console.log(process.env.GOOGLE_CLIENT_SECRET)

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://event-management-system-backend-00sp.onrender.com/api/auth/google/callback",
},
async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("Google Profile:", profile);  // Log profile for debugging

        // Check for an existing user
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
            return done(null, existingUser);
        }

        // If user does not exist, create a new user
        const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
        });
        done(null, newUser);
    } catch (error) {
        console.error("Error in Google OAuth strategy:", error);  // Log errors
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
