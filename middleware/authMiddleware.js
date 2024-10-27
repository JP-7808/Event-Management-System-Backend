import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1]; // Ensure the cookie is being sent in the request
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied check' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => { // Make sure you use the correct JWT_SECRET
        if (error) {
            console.log("Token verification error:", error.message); // Log error message for debugging
            return res.status(401).json({ msg: 'Token is not valid' });
        }

        req.user = user; // Attach user data to request
        next();
    });
};

const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id) {
            next();
        } else {
            return res.status(403).json({ msg: 'Authorization denied' });
        }
    });
};

export default verifyUser;
