const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    busId: { type: String, required: true, unique: true },
    routeId: { type: String, required: true },
    capacity: { type: Number, default: 40 },
    plateNumber: String,
    totalDistanceTraveled: { type: Number, default: 0 },

    // Real-time Telemetry (The Digital Twin State)
    currentStatus: {
        lat: Number,
        lng: Number,
        speed: Number,        // km/h
        fuelLevel: Number,    // %
        occupancy: Number,    // Count of passengers
        nextStop: String,
        etaNextStop: String,
        currentStopIndex: { type: Number, default: 0 },
        progressToNext: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now }
    }
});

module.exports = mongoose.model('Bus', BusSchema);
