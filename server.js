import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import authRoute from './routes/auth.js';
import eventRoute from './routes/event.js';
import ticketRoute from './routes/ticket.js'
import cookieParser from 'cookie-parser';



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
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: 'GET,POST,PUT,DELETE', // Allow these HTTP methods
    credentials: true, // Allow credentials (e.g., cookies)
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());


// Routes
app.use('/api/auth', authRoute);
app.use('/api/events', eventRoute);
app.use('/api/events', ticketRoute);

const PORT = process.env.PORT || 6600;
app.listen(PORT, () => {
    connect();
    console.log(`Server Running on Port ${PORT}`);
})



