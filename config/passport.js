import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

dotenv.config();

passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://event-management-system-backend-uela.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if there’s a user with the Google ID
            let existingUser = await User.findOne({ googleId: profile.id });
            
            if (existingUser) {
                // If the Google ID is found, the user exists, so log them in
                return done(null, existingUser);
            }

            // Check if the user exists with the same email but no Google ID
            existingUser = await User.findOne({ email: profile.emails[0].value });

            if (existingUser) {
                // Update the existing user with the Google ID
                existingUser.googleId = profile.id;
                await existingUser.save();
                return done(null, existingUser);
            }

            // If no user found, create a new one
            const newUser = await new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            }).save();
            done(null, newUser);
        } catch (err) {
            console.error(err);
            done(err, null);
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
