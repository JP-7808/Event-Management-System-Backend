import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1]; 
    console.log("check token", token);
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied check' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => { 
        if (error) {
            console.log("Token verification error:", error.message); 
            return res.status(401).json({ msg: 'Token is not valid' });
        }

        req.user = user; 
        next();
    });
};

const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user._id === req.params.id) {
            next();
        } else {
            return res.status(403).json({ msg: 'Authorization denied' });
        }
    });
};

export default verifyUser;
