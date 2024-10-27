import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: Date,
  time: String,
  location: String,
  ticketPrice: Number,
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;
