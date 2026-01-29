const mongoose = require('mongoose');

// This collection stores the history for the "Digital Twin Graph"
const TripLogSchema = new mongoose.Schema({
    busId: { type: String, required: true },
    routeId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },

    // Snapshot of state
    lat: Number,
    lng: Number,
    speed: Number,
    fuelLevel: Number,
    occupancy: Number,

    // For the graph comparison
    progressDistanceKm: Number, // Distance from start of route
    scheduledProgressDistanceKm: Number // Where it SHOULD be
}, { timestamps: true });

module.exports = mongoose.model('TripLog', TripLogSchema);
