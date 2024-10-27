import express from 'express';
import Event from '../models/Event.js';
import verifyToken from '../middleware/authMiddleware.js';
import verifyUser from '../middleware/authMiddleware.js';

const router = express.Router();

// Create Event Route
router.post('/create', verifyUser, async (req, res) => {
    try {
      const { title, description, date, time, location, ticketPrice, privacy } = req.body;
      const organizerId = req.user.id;
  
      const newEvent = new Event({ title, description, date, time, location, ticketPrice, privacy, organizerId });
      await newEvent.save();
  
      res.status(201).json({ success: true, message: 'Event created successfully!', event: newEvent });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
    }
  });



// Get all events for the logged-in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user._id });
        res.status(200).json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error fetching events' });
    }
});

// Get a specific event by ID
router.get('/:eventId', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error fetching event' });
    }
});

// Get attendees for a specific event
router.get('/:eventId/attendees', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId).populate('attendees'); // Assuming attendees are linked to users
        res.status(200).json(event.attendees);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error fetching attendees' });
    }
});



// Update event details
router.put('/:eventId', verifyToken, async (req, res) => {
    try {
        const { title, description, date, time, location, ticketPrice, privacy } = req.body;
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.eventId,
            { title, description, date, time, location, ticketPrice, privacy },
            { new: true }
        );
        
        if (!updatedEvent) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        res.status(200).json({ msg: 'Event updated successfully', event: updatedEvent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error updating event' });
    }
});

// Delete event
router.delete('/:eventId', verifyToken, async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.eventId);
        
        if (!deletedEvent) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        res.status(200).json({ msg: 'Event deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error deleting event' });
    }
});


// Register for an event
router.post('/:eventId/register', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        console.log("User ID from req.user:", req.user?.id); // Log to confirm `req.user._id`

        // Check if user ID is valid and not already registered
        if (!req.user?.id || event.attendees.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Already registered for this event or invalid user ID' });
        }

        event.attendees.push(req.user.id); // Add user to attendees
        await event.save();

        const updatedEvent = await Event.findById(req.params.eventId).populate('attendees', 'name email');
        res.status(200).json({
            msg: 'Registration successful',
            attendeeCount: updatedEvent.attendees.length, // Correctly use populated attendees
            attendees: updatedEvent.attendees // Use populated details
        });
    } catch (err) {
        console.error('Error in registration:', err);
        res.status(500).json({ msg: 'Error registering for event' });
    }
});


// Get attendees for a specific event
router.get('/:eventId/attendees', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId).populate('attendees', 'name email'); // Populate attendee details
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        res.status(200).json({ attendees: event.attendees, count: event.attendees.length },);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error fetching attendees' });
    }
});

// Send notifications to attendees (dummy endpoint for implementation)
router.post('/:eventId/notifications', verifyToken, async (req, res) => {
    try {
        // Logic to send notifications (e.g., via email or in-app notifications)
        res.status(200).json({ msg: 'Notifications sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error sending notifications' });
    }
});


export default router;
