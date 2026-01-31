const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const runSimulation = require('./simulator');
const Bus = require('./models/Bus');
const TripLog = require('./models/TripLog');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const Route = require('./models/Route');

// 0. Get All Available Stops (For Search Autocomplete)
app.get('/api/stops', async (req, res) => {
    try {
        const routes = await Route.find();
        const allStops = routes.flatMap(r => r.stops.map(s => s.name));
        const uniqueStops = [...new Set(allStops)].sort();
        res.json(uniqueStops);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. Search / Get All Buses with Live Status
// 1. Search / Get All Buses with Live Status
app.get('/api/buses', async (req, res) => {
    try {
        const { from, to } = req.query;
        let query = {};

        if (from && to) {
            const routes = await Route.find();

            // NORMALIZER HELPER
            const isMatch = (stopName, query) => stopName.toLowerCase().includes(query.toLowerCase().trim());

            // 1. TRY DIRECT ROUTES
            const validRouteIds = routes.filter(r => {
                const fIdx = r.stops.findIndex(s => isMatch(s.name, from));
                const tIdx = r.stops.findIndex(s => isMatch(s.name, to));
                return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
            }).map(r => r.routeId);

            if (validRouteIds.length > 0) {
                query.routeId = { $in: validRouteIds };
            } else {
                // 2. TRY CONNECTING ROUTES (1-HOP TRANSFER)
                // Filter routes that contain start/end loosely
                const fromRoutes = routes.filter(r => r.stops.some(s => isMatch(s.name, from)));
                const toRoutes = routes.filter(r => r.stops.some(s => isMatch(s.name, to)));

                let bestSolution = null;

                for (const r1 of fromRoutes) {
                    for (const r2 of toRoutes) {
                        // Find common stops (Intersection)
                        const commonStops = r1.stops.filter(s1 => r2.stops.some(s2 => s2.name === s1.name));

                        for (const hub of commonStops) {
                            // Check Directionality
                            const fIdx = r1.stops.findIndex(s => isMatch(s.name, from));
                            const hIdx1 = r1.stops.findIndex(s => s.name === hub.name);

                            const hIdx2 = r2.stops.findIndex(s => s.name === hub.name);
                            const tIdx = r2.stops.findIndex(s => isMatch(s.name, to));

                            // If valid path: From -> Hub -> To
                            if (fIdx < hIdx1 && hIdx2 < tIdx) {
                                bestSolution = {
                                    leg1Route: r1,
                                    leg2Route: r2,
                                    transferAt: hub.name
                                };
                                break;
                            }
                        }
                        if (bestSolution) break;
                    }
                    if (bestSolution) break;
                }

                if (bestSolution) {
                    const buses = await Bus.find({ routeId: bestSolution.leg1Route.routeId });
                    const annotatedBuses = buses.map(b => ({
                        ...b.toObject(),
                        isMultiLeg: true,
                        transferAt: bestSolution.transferAt,
                        finalDestination: to, // Pass the users original 'to' input for display
                        leg2RouteName: bestSolution.leg2Route.name,
                        routeStops: bestSolution.leg1Route.stops
                    }));
                    return res.json(annotatedBuses);
                }

                // 3. FALLBACK: IF NO ROUTE FOUND, RETURN ALL BUSES BUT WARN?
                // Or just return empty. User said "every city i need a bus".
                // Let's return NO results to avoid lying, but Frontend should handle "No buses found" gracefully.
                return res.json([]);
            }
        }

        const buses = await Bus.find(query);
        // Attach Full Route details for Visualization
        const routes = await Route.find();
        const busesWithRoute = buses.map(b => {
            const route = routes.find(r => r.routeId === b.routeId);
            return {
                ...b.toObject(),
                routeStops: route ? route.stops : []
            };
        });
        res.json(busesWithRoute);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get Digital Twin History (For the Graph)
app.get('/api/buses/:id/digital-twin', async (req, res) => {
    try {
        const { id } = req.params;
        // Return last 50 logs for the graph
        const logs = await TripLog.find({ busId: id })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(logs.reverse());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const Booking = require('./models/Booking');

// ... (Routes) ...

// 4. GET SEAT MAP (Merge Simulation + Real)
app.get('/api/buses/:id/seats', async (req, res) => {
    try {
        const { id } = req.params;
        const bus = await Bus.findOne({ busId: id });
        if (!bus) return res.status(404).json({ error: 'Bus not found' });

        // 1. Get Real User Bookings
        const realBookings = await Booking.find({ busId: id, status: 'CONFIRMED' });
        const realBookedSeats = realBookings.flatMap(b => b.seatNumbers);

        // 2. Calculate Simulation "Ghost" Occupancy
        // The simulation says "25 people inside". We know real users booked X seats.
        // So (25 - X) seats must be filled by random "Ghost" passengers.
        let simOccupancy = bus.currentStatus.occupancy || 0;
        let seatsToBlock = Math.max(0, simOccupancy - realBookedSeats.length);

        // 3. Generate Seat Map (40 Seats)
        const totalSeats = 40; // Fixed capacity for now
        let seats = [];
        let availableSeatNumbers = [];

        // Identify available candidate seats for ghosts
        for (let i = 1; i <= totalSeats; i++) {
            if (!realBookedSeats.includes(i)) {
                availableSeatNumbers.push(i);
            }
        }

        // Shuffle available seats to randomize ghost positions
        availableSeatNumbers.sort(() => Math.random() - 0.5);
        const ghostSeats = availableSeatNumbers.slice(0, seatsToBlock);

        // Build Final Map
        for (let i = 1; i <= totalSeats; i++) {
            let status = 'AVAILABLE';
            if (realBookedSeats.includes(i)) {
                status = 'BOOKED_BY_USER';
            } else if (ghostSeats.includes(i)) {
                status = 'OCCUPIED'; // By simulation
            }

            seats.push({
                number: i,
                status: status,
                isWindow: i % 4 === 1 || i % 4 === 0 // 1,4,5,8... are windows
            });
        }

        res.json({
            busId: id,
            totalSeats,
            seats
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Book Ticket (Real)
app.post('/api/bookings', async (req, res) => {
    try {
        const { busId, seatNumbers, customerName, amount } = req.body;

        // Validation: Check if seats are already taken by REAL users
        const existing = await Booking.findOne({
            busId,
            status: 'CONFIRMED',
            seatNumbers: { $in: seatNumbers }
        });

        if (existing) {
            return res.status(400).json({ error: 'One or more selected seats are already booked.' });
        }

        const tickId = `TKT-${busId}-${Date.now()}`;

        const newBooking = await Booking.create({
            ticketId: tickId,
            busId,
            seatNumbers,
            customerName: customerName || 'Guest',
            amount: amount || 50
        });

        // OPTIONAL: Update simulation occupancy to reflect new person?
        // Let's trust the simulation loop to eventually correct itself or we force it:
        // await Bus.updateOne({ busId }, { $inc: { 'currentStatus.occupancy': seatNumbers.length } });

        res.json({ success: true, ticketId: tickId, booking: newBooking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get All Bookings (For Manage Booking)
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. User Login (Mock)
app.post('/api/login', async (req, res) => {
    // ... (unchanged)
    try {
        console.log(`Login Request received: ${JSON.stringify(req.body)}`);
        const { phone, otp } = req.body;
        // In a real app, verify OTP here.
        // For demo, accept any phone and mock user.
        res.json({
            success: true,
            user: {
                name: 'Rakesh Yanamala',
                phone: phone,
                avatar: 'https://ui-avatars.com/api/?name=Rakesh+Y&background=d90429&color=fff'
            },
            token: 'mock-jwt-token-123'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Main Execution
const PORT = 5001; // HARDCODED TO FIX NETWORK ERROR

const startServer = async () => {
    try {
        // ... (mongo connection)
        let mongoUri = process.env.MONGO_URI;
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        console.log(`Using In-Memory MongoDB at ${mongoUri}`);

        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected (In-Memory)');

        // Start the IoT Simulation
        runSimulation();

        // Log all requests
        app.use((req, res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} (EXCEL BUS VERSION)`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();
