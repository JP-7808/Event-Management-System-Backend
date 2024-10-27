import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();


// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:6600/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if a user with the same email already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // If the user exists, return the user and token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return done(null, { user, token });
        }

        // If the user does not exist, create a new user
        user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
        });
        await user.save();

        // Generate JWT token for the new user
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return new user and token
        return done(null, { user, token });
    } catch (error) {
        console.error("Error during Google authentication:", error); // Log the error for debugging
        return done(error, false);
    }
}));

export default passport;
