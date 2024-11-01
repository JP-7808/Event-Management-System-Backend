import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import './config/passport.js'
import authRoute from './routes/auth.js';
import eventRoute from './routes/event.js';
import ticketRoute from './routes/ticket.js'
import cookieParser from 'cookie-parser';
import paymentRoute from './routes/razorpay.js'


dotenv.config();
const app = express();

const connect = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDb");
    }catch(error){
        throw error;
    }
}

mongoose.connection.on("disconnected", () => {
    console.log("MongoDb Disconnected");
})

// middleWare
app.options('*', cors({
    origin: [
        'https://event-management-system-frontend-liart.vercel.app',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));


app.use(
    session({
      secret: process.env.JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      },
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/events', eventRoute);
app.use('/api/events', ticketRoute);
app.use('/api/payments', paymentRoute);


const PORT = process.env.PORT || 6600;
app.listen(PORT, () => {
    connect();
    console.log(`Server Running on Port ${PORT}`);
})



