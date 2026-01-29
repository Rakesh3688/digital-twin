const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    busId: { type: String, required: true },
    seatNumbers: [{ type: Number, required: true }], // Array of seat numbers (1-40)
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
