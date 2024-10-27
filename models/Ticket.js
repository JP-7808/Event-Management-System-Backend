import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Ticket', TicketSchema);