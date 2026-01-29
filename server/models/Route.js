const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    routeId: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // e.g., "City Center - Tech Park"
    totalDistanceKm: Number,
    stops: [
        {
            name: String,
            lat: Number,
            lng: Number,
            stopOrder: Number,
            scheduledTimeOffsetMinutes: Number // Minutes from start
        }
    ]
});

module.exports = mongoose.model('Route', RouteSchema);
