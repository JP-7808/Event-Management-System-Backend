import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import passport from '../config/passport.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'user already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Generate Token
        res.status(200).send("User has been created");
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error in Creating user');
    }
});

// Login
router.post('/login', async (req, res) => {

    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ msg: 'invalid credentials' });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'invalid Credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const {password, ...otherDetails} = user._doc;
        res.cookie('access_token', token,{
            httpOnly: true,
        })
        .status(200)
        .json({details:{...otherDetails}, token});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error in Login');
    }
});

// Get current user details
router.get('/currentUser', verifyToken, async (req, res) => {
    try {
        // Optionally, fetch complete user details from the database
        const user = await User.findById(req.user.id); // Ensure that req.user contains the user ID
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json(user); // Send back user details
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ msg: 'Error fetching user details' });
    }
});

// Google Login Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const { user } = req;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Send the user data and token to the frontend
    res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    }).status(200).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
        token
    });
});



// Protected Route Example
router.get('/protected-route', verifyToken, (req, res) => {
    res.status(200).json({ msg: 'This is a protected route and you are authenticated!' });
});

export default router;
