const mongoose = require('mongoose');
const Bus = require('./models/Bus');
const Route = require('./models/Route');
const TripLog = require('./models/TripLog');
require('dotenv').config();

// Configuration
const UPDATE_INTERVAL_MS = 2000;
const SPEED_KMH = 40;

// Seed Data
const SEED_ROUTES = [
    // 1. ORIGINAL: Secunderabad - Hitech City
    {
        routeId: '24E_24S',
        name: 'Secunderabad - Hitech City',
        totalDistanceKm: 18,
        stops: [
            { name: 'Secunderabad Stn', lat: 17.4399, lng: 78.4983, stopOrder: 1, scheduledTimeOffsetMinutes: 0 },
            { name: 'Patny', lat: 17.4410, lng: 78.4950, stopOrder: 2, scheduledTimeOffsetMinutes: 5 },
            { name: 'Paradise', lat: 17.4411, lng: 78.4877, stopOrder: 3, scheduledTimeOffsetMinutes: 10 },
            { name: 'Rasoolpura', lat: 17.4430, lng: 78.4800, stopOrder: 4, scheduledTimeOffsetMinutes: 15 },
            { name: 'Begumpet', lat: 17.4447, lng: 78.4614, stopOrder: 5, scheduledTimeOffsetMinutes: 20 },
            { name: 'Panjagutta', lat: 17.4256, lng: 78.4520, stopOrder: 6, scheduledTimeOffsetMinutes: 35 },
            { name: 'Banjara Hills', lat: 17.4150, lng: 78.4400, stopOrder: 7, scheduledTimeOffsetMinutes: 40 },
            { name: 'Jubilee Hills Checkpost', lat: 17.4280, lng: 78.4100, stopOrder: 8, scheduledTimeOffsetMinutes: 45 },
            { name: 'Madhapur', lat: 17.4486, lng: 78.3908, stopOrder: 9, scheduledTimeOffsetMinutes: 50 },
            { name: 'Hitech City', lat: 17.4435, lng: 78.3772, stopOrder: 10, scheduledTimeOffsetMinutes: 60 },
            { name: 'Kondapur', lat: 17.4600, lng: 78.3650, stopOrder: 11, scheduledTimeOffsetMinutes: 65 }
        ]
    },
    // 2. ORIGINAL: Lingampally - Uppal
    {
        routeId: '217_L',
        name: 'Lingampally - Uppal',
        totalDistanceKm: 28,
        stops: [
            { name: 'Lingampally', lat: 17.4932, lng: 78.3182, stopOrder: 1, scheduledTimeOffsetMinutes: 0 },
            { name: 'Chanda Nagar', lat: 17.4900, lng: 78.3300, stopOrder: 2, scheduledTimeOffsetMinutes: 10 },
            { name: 'Miyapur', lat: 17.4960, lng: 78.3600, stopOrder: 3, scheduledTimeOffsetMinutes: 15 },
            { name: 'Kondapur', lat: 17.4600, lng: 78.3650, stopOrder: 4, scheduledTimeOffsetMinutes: 25 },
            { name: 'Hitech City', lat: 17.4435, lng: 78.3772, stopOrder: 5, scheduledTimeOffsetMinutes: 28 },
            { name: 'Gachibowli', lat: 17.4401, lng: 78.3489, stopOrder: 6, scheduledTimeOffsetMinutes: 30 },
            { name: 'Mehdipatnam', lat: 17.3952, lng: 78.4312, stopOrder: 7, scheduledTimeOffsetMinutes: 45 },
            { name: 'Lakdikapul', lat: 17.3900, lng: 78.4500, stopOrder: 8, scheduledTimeOffsetMinutes: 55 },
            { name: 'Koti', lat: 17.3850, lng: 78.4867, stopOrder: 9, scheduledTimeOffsetMinutes: 70 },
            { name: 'Dilsukhnagar', lat: 17.3680, lng: 78.5200, stopOrder: 10, scheduledTimeOffsetMinutes: 80 },
            { name: 'Uppal X Roads', lat: 17.4018, lng: 78.5602, stopOrder: 11, scheduledTimeOffsetMinutes: 90 }
        ]
    },
    // 3. ORIGINAL: Charminar - Zoo Park
    {
        routeId: '2Z',
        name: 'Charminar - Zoo Park',
        totalDistanceKm: 12,
        stops: [
            { name: 'Secunderabad Stn', lat: 17.4399, lng: 78.4983, stopOrder: 1, scheduledTimeOffsetMinutes: 0 },
            { name: 'Koti', lat: 17.3850, lng: 78.4867, stopOrder: 2, scheduledTimeOffsetMinutes: 15 },
            { name: 'Afzalgunj', lat: 17.3760, lng: 78.4780, stopOrder: 3, scheduledTimeOffsetMinutes: 20 },
            { name: 'Madina', lat: 17.3700, lng: 78.4790, stopOrder: 4, scheduledTimeOffsetMinutes: 25 },
            { name: 'Charminar', lat: 17.3616, lng: 78.4747, stopOrder: 5, scheduledTimeOffsetMinutes: 30 },
            { name: 'Zoo Park', lat: 17.3496, lng: 78.4682, stopOrder: 6, scheduledTimeOffsetMinutes: 40 }
        ]
    },
    // 4. NEW: Secunderabad - Patancheru (Covers Ameerpet, Kukatpally)
    {
        routeId: '219',
        name: 'Secunderabad - Patancheru',
        totalDistanceKm: 32,
        stops: [
            { name: 'Secunderabad Stn', lat: 17.4399, lng: 78.4983, stopOrder: 1, scheduledTimeOffsetMinutes: 0 },
            { name: 'Paradise', lat: 17.4411, lng: 78.4877, stopOrder: 2, scheduledTimeOffsetMinutes: 5 },
            { name: 'Begumpet', lat: 17.4447, lng: 78.4614, stopOrder: 3, scheduledTimeOffsetMinutes: 12 },
            { name: 'Ameerpet', lat: 17.4375, lng: 78.4487, stopOrder: 4, scheduledTimeOffsetMinutes: 18 },
            { name: 'SR Nagar', lat: 17.4426, lng: 78.4429, stopOrder: 5, scheduledTimeOffsetMinutes: 22 },
            { name: 'Bharat Nagar', lat: 17.4641, lng: 78.4239, stopOrder: 6, scheduledTimeOffsetMinutes: 30 },
            { name: 'Kukatpally', lat: 17.4875, lng: 78.4010, stopOrder: 7, scheduledTimeOffsetMinutes: 38 },
            { name: 'KPHB Colony', lat: 17.4933, lng: 78.3914, stopOrder: 8, scheduledTimeOffsetMinutes: 42 },
            { name: 'Miyapur', lat: 17.4960, lng: 78.3600, stopOrder: 9, scheduledTimeOffsetMinutes: 50 },
            { name: 'BHEL', lat: 17.5029, lng: 78.3090, stopOrder: 10, scheduledTimeOffsetMinutes: 60 },
            { name: 'Patancheru', lat: 17.5297, lng: 78.2678, stopOrder: 11, scheduledTimeOffsetMinutes: 70 }
        ]
    },
    // 5. NEW: Kondapur - Koti (IT Corridor)
    {
        routeId: '127K',
        name: 'Kondapur - Koti',
        totalDistanceKm: 22,
        stops: [
            { name: 'Kondapur', lat: 17.4600, lng: 78.3650, stopOrder: 1, scheduledTimeOffsetMinutes: 0 },
            { name: 'Hitech City', lat: 17.4435, lng: 78.3772, stopOrder: 2, scheduledTimeOffsetMinutes: 10 },
            { name: 'Madhapur', lat: 17.4486, lng: 78.3908, stopOrder: 3, scheduledTimeOffsetMinutes: 15 },
            { name: 'Jubilee Hills Checkpost', lat: 17.4280, lng: 78.4100, stopOrder: 4, scheduledTimeOffsetMinutes: 25 },
            { name: 'Banjara Hills', lat: 17.4150, lng: 78.4400, stopOrder: 5, scheduledTimeOffsetMinutes: 35 },
            { name: 'Mehdipatnam', lat: 17.3952, lng: 78.4312, stopOrder: 6, scheduledTimeOffsetMinutes: 45 },
            { name: 'Lakdikapul', lat: 17.3900, lng: 78.4500, stopOrder: 7, scheduledTimeOffsetMinutes: 55 },
            { name: 'Koti', lat: 17.3850, lng: 78.4867, stopOrder: 8, scheduledTimeOffsetMinutes: 65 }
        ]
    },
    // 6. NEW: JBS - LB Nagar
    {
        routeId: '290',
        name: 'JBS - LB Nagar',
        totalDistanceKm: 20,
        stops: [
            { name: 'Jubilee Bus Station (JBS)', lat: 17.4474, lng: 78.4988, stopOrder: 1, scheduledTimeOffsetMinutes: 0 },
            { name: 'Secunderabad Stn', lat: 17.4399, lng: 78.4983, stopOrder: 2, scheduledTimeOffsetMinutes: 10 },
            { name: 'Tarnaka', lat: 17.4296, lng: 78.5395, stopOrder: 3, scheduledTimeOffsetMinutes: 20 },
            { name: 'Habsiguda', lat: 17.4082, lng: 78.5422, stopOrder: 4, scheduledTimeOffsetMinutes: 28 },
            { name: 'Uppal X Roads', lat: 17.4018, lng: 78.5602, stopOrder: 5, scheduledTimeOffsetMinutes: 35 },
            { name: 'Nagole', lat: 17.3753, lng: 78.5692, stopOrder: 6, scheduledTimeOffsetMinutes: 45 },
            { name: 'LB Nagar', lat: 17.3457, lng: 78.5522, stopOrder: 7, scheduledTimeOffsetMinutes: 55 }
        ]
    },
    // 7. NEW: Airport Liner (Pushpak) - UNIQUE
    {
        routeId: 'AM_Pushpak',
        name: 'Airport - Hitech City',
        totalDistanceKm: 35,
        stops: [
            { name: 'Jubilee Bus Station (JBS)', lat: 17.4474, lng: 78.4988, stopOrder: 1, scheduledTimeOffsetMinutes: 0 },
            { name: 'Hitech City', lat: 17.4435, lng: 78.3772, stopOrder: 2, scheduledTimeOffsetMinutes: 40 },
            { name: 'Gachibowli', lat: 17.4401, lng: 78.3489, stopOrder: 3, scheduledTimeOffsetMinutes: 50 },
            { name: 'RGIA Airport', lat: 17.2403, lng: 78.4294, stopOrder: 4, scheduledTimeOffsetMinutes: 80 }
        ]
    }
];

// GENERATE REVERSE ROUTES (Return Journey)
const REVERSE_ROUTES = SEED_ROUTES.map(route => {
    const reversedStops = [...route.stops].reverse().map((stop, index) => ({
        ...stop,
        stopOrder: index + 1,
        scheduledTimeOffsetMinutes: index * 10
    }));

    return {
        ...route,
        routeId: route.routeId + '_REV',
        name: route.name + ' (Return)',
        stops: reversedStops
    };
});

const ALL_ROUTES = [...SEED_ROUTES, ...REVERSE_ROUTES];

// GENERATE BUSES AUTOMATICALLY
const SEED_BUSES = [];
ALL_ROUTES.forEach(route => {
    // Create 6 buses per route for better availability (User requested "n numbers")
    for (let i = 1; i <= 6; i++) {
        SEED_BUSES.push({
            busId: `bus_${route.routeId}_0${i}`,
            routeId: route.routeId,
            plateNumber: `TS-${Math.floor(Math.random() * 30 + 10)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${1000 + Math.floor(Math.random() * 9000)}`
        });
    }
});

async function seedData() {
    // Clear old data to ensure fresh routes are loaded if needed (Optional, but good for dev)
    // await Route.deleteMany({}); 
    // await Bus.deleteMany({});

    // FORCE FRESH START: Always clear data to ensure randomization works
    console.log('🧹 Clearing old data for fresh simulation...');
    await Route.deleteMany({});
    await Bus.deleteMany({});

    console.log('🌱 Seeding Routes...');
    await Route.insertMany(ALL_ROUTES);

    console.log('🚌 Seeding Buses (Randomized Locations)...');
    // ... insert logic follows ...
    await Bus.deleteMany({}); // Force refresh
    await Bus.insertMany(SEED_BUSES.map(b => {
        const route = ALL_ROUTES.find(r => r.routeId === b.routeId);
        // Randomize Start Position along the route
        const randStopIdx = Math.floor(Math.random() * (route.stops.length - 1));
        const randProgress = Math.random(); // 0.0 to 1.0 between stops

        const currStop = route.stops[randStopIdx];
        const nextStop = route.stops[randStopIdx + 1];

        // Interpolate initial lat/lng
        const initLat = currStop.lat + (nextStop.lat - currStop.lat) * randProgress;
        const initLng = currStop.lng + (nextStop.lng - currStop.lng) * randProgress;

        return {
            ...b,
            currentStatus: {
                lat: initLat,
                lng: initLng,
                speed: 30 + Math.random() * 10,
                fuelLevel: 50 + Math.random() * 50,
                occupancy: Math.floor(Math.random() * 30),
                lastUpdated: new Date(),
                currentStopIndex: randStopIdx,
                progressToNext: randProgress,
                nextStop: nextStop.name,
                etaNextStop: `${Math.ceil((1 - randProgress) * 10)} mins`,
                totalDistCovered: (randStopIdx * 2) + randProgress,
                delayFactor: 0.8 + Math.random() * 0.4
            }
        };
    }));
}

// movement logic helper
function moveBus(bus, route) {
    // Destructure current status with defaults
    let { lat, lng, currentStopIndex, progressToNext, speed, fuelLevel, occupancy, totalDistCovered, delayFactor } = bus.currentStatus || {};

    // Safety check / Initialize if fresh bus
    if (!totalDistCovered) totalDistCovered = 0;
    if (!delayFactor) delayFactor = 1.0;

    // Safety check / Initialize if fresh bus
    if (currentStopIndex === undefined) currentStopIndex = 0;
    if (progressToNext === undefined) progressToNext = 0;
    if (occupancy === undefined) occupancy = Math.floor(Math.random() * 20);
    if (fuelLevel === undefined) fuelLevel = 100;
    if (lat === undefined && route.stops.length > 0) {
        lat = route.stops[0].lat;
        lng = route.stops[0].lng;
    }

    // Simple simulation: Move back and forth between stops or just circle
    if (progressToNext === undefined) progressToNext = 0;

    if (currentStopIndex >= route.stops.length - 1) {
        // Reached end, reset to start (Circular Loop for Demo)
        currentStopIndex = 0;
        progressToNext = 0;
        // Reset occupancy at "Terminus" to ~15 people (starting new trip)
        occupancy = 15;
    }

    const currentStop = route.stops[currentStopIndex];
    const nextStop = route.stops[currentStopIndex + 1];

    // Calculate progression
    // Distance between stops (approx linear)
    const dist = Math.sqrt(Math.pow(nextStop.lat - currentStop.lat, 2) + Math.pow(nextStop.lng - currentStop.lng, 2));
    // scale dist to "simulation steps"
    // scale dist to "simulation steps"
    const stepSize = 0.005; // Base speed

    progressToNext += stepSize;
    totalDistCovered += stepSize * 5; // Accumulate distance for graph

    if (progressToNext >= 1) {
        // Arrived at next stop
        currentStopIndex++;
        progressToNext = 0;

        // --- STOP INTERACTION LOGIC ---
        // Bus has arrived. Simulate passengers getting ON and OFF
        const peopleGettingOff = Math.floor(Math.random() * 5); // 0-4 get off
        const peopleGettingOn = Math.floor(Math.random() * 8);  // 0-7 get on (slightly more demand)

        occupancy = occupancy - peopleGettingOff + peopleGettingOn;
        // Clamp limits (0 to 40 max capacity)
        occupancy = Math.max(0, Math.min(40, occupancy));
    }

    // Interpolate Position
    const nextStopObj = route.stops[currentStopIndex + 1];
    const currStopObj = route.stops[currentStopIndex];

    if (nextStopObj && currStopObj) {
        lat = currStopObj.lat + (nextStopObj.lat - currStopObj.lat) * progressToNext;
        lng = currStopObj.lng + (nextStopObj.lng - currStopObj.lng) * progressToNext;
    }

    // New Data
    speed = Math.floor(Math.random() * 10) + 30; // 30-40 km/h
    fuelLevel = Math.max(0, fuelLevel - 0.05);

    // Calculate ETA (Mock)
    const stopsRemaining = route.stops.length - 1 - currentStopIndex;

    // Ensure lastUpdated is a valid Date object
    const lastUpdated = new Date();

    return {
        lat: Number(lat),
        lng: Number(lng),
        speed: Number(speed),
        fuelLevel: Number(fuelLevel),
        occupancy: Number(occupancy),
        lastUpdated: lastUpdated, // Schema requires Date
        currentStopIndex: Number(currentStopIndex),
        progressToNext: Number(progressToNext),
        nextStop: nextStopObj ? nextStopObj.name : "Terminating",
        nextStop: nextStopObj ? nextStopObj.name : "Terminating",
        etaNextStop: `${Math.ceil((1 - progressToNext) * 10 * delayFactor)} mins`,
        totalDistCovered,
        delayFactor
    };
}

async function runSimulation() {
    console.log('Starting IoT Simulation...');
    // await mongoose.connect(process.env.MONGO_URI); // REMOVED: Reuse server connection
    await seedData();

    setInterval(async () => {
        const buses = await Bus.find();
        const routes = await Route.find();

        for (const bus of buses) {
            const route = routes.find(r => r.routeId === bus.routeId);
            if (!route) continue;

            const newStatus = moveBus(bus, route);

            // 1. Update Live Status
            bus.currentStatus = newStatus;
            await bus.save();

            // 2. Log History for Digital Twin Graph
            // We calculate "progress" as simple distance from start for now
            // ideally verify using Haversine formula
            await TripLog.create({
                busId: bus.busId,
                routeId: bus.routeId,
                lat: newStatus.lat,
                lng: newStatus.lng,
                speed: newStatus.speed,
                fuelLevel: newStatus.fuelLevel,
                occupancy: newStatus.occupancy,
                // REAL DATA for Graph
                progressDistanceKm: newStatus.totalDistCovered,
                // Scheduled is "Ideal" (so if delayFactor is 1.2 (slow), covered < scheduled)
                scheduledProgressDistanceKm: newStatus.totalDistCovered * (newStatus.delayFactor || 1)
            });
        }
    }, UPDATE_INTERVAL_MS);
}

// If run directly
if (require.main === module) {
    runSimulation();
}

module.exports = runSimulation;
