import express from 'express';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Post a ticket to the database after successful payment
router.post('/:eventId/ticket', verifyToken, async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user && req.user.id; // Ensure userId is defined

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const existingTicket = await Ticket.findOne({ event: eventId, user: userId });
        if (existingTicket) {
            return res.status(400).json({ message: 'Ticket already exists for this user and event' });
        }

        const newTicket = new Ticket({
            event: eventId,
            user: userId,
            createdAt: new Date(),
        });

        await newTicket.save();

        // Add the user to the event's attendees array if not already included
        if (!event.attendees.includes(userId)) {
            event.attendees.push(userId);
            await event.save();
        }

        res.status(201).json({
            message: 'Ticket created successfully, and user added to attendees',
            ticket: newTicket,
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get ticket details by eventId
router.get('/:eventId/ticket', verifyToken, async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user && req.user.id;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const ticket = await Ticket.findOne({ event: eventId, user: userId })
            .populate('user', 'name')
            .populate('event', 'title date time location');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
