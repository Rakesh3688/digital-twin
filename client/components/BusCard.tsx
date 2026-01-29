"use client";

import { Activity, Fuel, Gauge, Users, MapPin } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import SeatSelectionModal from "./SeatSelectionModal";
import PaymentModal from "./PaymentModal";

interface BusProps {
    busId: String;
    plateNumber: String;
    currentStatus: {
        speed: number;
        fuelLevel: number;
        occupancy: number; // e.g., out of 40
        nextStop: string;
        etaNextStop: string;
        delayFactor?: number;
    };
    routeStops: any[];
}

export default function BusCard({ bus }: { bus: any }) {
    const [expanded, setExpanded] = useState(false);
    const [bookingStage, setBookingStage] = useState<'NONE' | 'SEATS' | 'PAY'>('NONE');
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

    const occupancyPercent = (bus.currentStatus.occupancy / bus.capacity) * 100;

    // Calculate Arrival Graph Data with Traffic Simulation
    let accumulatedEstimatedTime = 0;

    // Create a deterministic "random" noise based on bus ID to keep graph stable between renders
    const pseudoRandom = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const graphData = bus.routeStops ? bus.routeStops.map((stop: any, idx: number) => {
        const scheduledTime = stop.scheduledTimeOffsetMinutes || (idx * 15);

        if (idx === 0) {
            accumulatedEstimatedTime = 0;
            return {
                name: stop.name.substring(0, 10),
                fullStopName: stop.name,
                Scheduled: 0,
                Estimated: 0
            };
        }

        // Previous stop time
        const prevScheduled = (bus.routeStops[idx - 1]?.scheduledTimeOffsetMinutes) || ((idx - 1) * 15);
        const segmentDurationIdeal = scheduledTime - prevScheduled;

        // TRAFFIC LOGIC:
        // 1. Base Bus Speed Factor (Global for this bus)
        const baseFactor = bus.currentStatus.delayFactor || 1.0;

        // 2. Segment "Noise" (Simulate traffic at different parts of city)
        // Use char code of stop name to make it consistent for that stop
        const stopSeed = stop.name.charCodeAt(0) + idx;
        const trafficVariance = 0.8 + (pseudoRandom(stopSeed) * 0.4); // Random between 0.8x (Fast) and 1.2x (Slow)

        // 3. Combined Segment Time
        const actualSegmentDuration = segmentDurationIdeal * baseFactor * trafficVariance;

        accumulatedEstimatedTime += actualSegmentDuration;

        return {
            name: stop.name.substring(0, 10),
            fullStopName: stop.name,
            Scheduled: scheduledTime,
            Estimated: Math.round(accumulatedEstimatedTime)
        };
    }) : [];

    const toggleExpanded = () => setExpanded(!expanded);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg transition-all hover:border-cyan-500/50">
            <div className="p-6">
                {/* Transfer Alert */}
                {bus.isMultiLeg && (
                    <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3 animate-fade-in">
                        <div className="bg-amber-500/20 p-1 rounded">
                            <MapPin className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-amber-400 text-sm font-bold">Transfer Required at {bus.transferAt}</p>
                            <p className="text-amber-500/80 text-xs">Take this bus to {bus.transferAt}, then change to {bus.leg2RouteName} for {bus.finalDestination}.</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-cyan-500/10 text-cyan-400 text-xs font-bold px-2 py-1 rounded">LIVE</span>
                            <h3 className="text-xl font-bold text-white">{bus.routeId}</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Bus {bus.plateNumber}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-mono text-cyan-400">{bus.currentStatus.speed} <span className="text-sm text-gray-500">km/h</span></p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Occupancy */}
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs uppercase">
                            <Users className="w-4 h-4" /> Occupancy
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full transition-all duration-500",
                                    occupancyPercent > 80 ? "bg-red-500" : occupancyPercent > 50 ? "bg-yellow-500" : "bg-green-500"
                                )}
                                style={{ width: `${occupancyPercent}%` }}
                            />
                        </div>
                        <p className="mt-1 text-right text-xs text-white">{bus.currentStatus.occupancy} / {bus.capacity}</p>
                    </div>

                    {/* Fuel */}
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs uppercase">
                            <Fuel className="w-4 h-4" /> Range
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${bus.currentStatus.fuelLevel}%` }}
                            />
                        </div>
                        <p className="mt-1 text-right text-xs text-white">{bus.currentStatus.fuelLevel.toFixed(0)}%</p>
                    </div>

                    {/* Speed Indicator */}
                    <div className="bg-slate-800/50 p-3 rounded-lg flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
                            <Activity className="w-4 h-4" /> Health
                        </div>
                        <p className="text-white text-sm font-semibold text-right">Optimal</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* Live Tracking Status */}
                    <div className="flex-1 bg-slate-800/50 p-3 rounded-lg flex flex-col justify-center">
                        <div className="flex justify-between items-end mb-1">
                            <div className="text-gray-400 text-[10px] uppercase">Next Stop</div>
                            <div className={cn("text-[10px] font-bold px-1.5 rounded",
                                (bus.capacity - bus.currentStatus.occupancy) > 10 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            )}>
                                {bus.capacity - bus.currentStatus.occupancy} SEATS LEFT
                            </div>
                        </div>
                        <div className="text-white font-bold text-sm truncate">{bus.currentStatus.nextStop || "Calculating..."}</div>
                        <div className="text-cyan-400 text-xs mt-1 font-mono">Arriving in {bus.currentStatus.etaNextStop || "--"}</div>
                    </div>

                    <button
                        onClick={toggleExpanded}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg transition-colors"
                    >
                        <Activity className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setBookingStage('SEATS')}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-cyan-900/20"
                    >
                        Book Ticket
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/40 border-t border-white/5"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-cyan-400 font-bold flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Estimated vs Actual Arrival
                                </h4>
                                <div className="text-xs text-gray-500">
                                    Bus Delay Factor: <span className="text-white font-mono">{bus.currentStatus.delayFactor?.toFixed(2) || "1.00"}x</span>
                                </div>
                            </div>

                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={graphData}>
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-45} textAnchor="end" height={50} />
                                        <YAxis stroke="#64748b" fontSize={10} label={{ value: 'Mins from Start', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const scheduledMins = payload[0].value as number;
                                                    const estimatedMins = payload[1].value as number;

                                                    // Helper to format time (Start Time assumed 08:00 AM for demo if not present)
                                                    const formatTime = (mins: number) => {
                                                        const date = new Date();
                                                        date.setHours(8, 0, 0, 0); // Base Start Time
                                                        date.setMinutes(date.getMinutes() + mins);
                                                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                    };

                                                    return (
                                                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
                                                            <p className="text-white font-bold text-sm mb-2">{label}</p>
                                                            <div className="space-y-1">
                                                                <p className="text-purple-400 text-xs flex justify-between gap-4">
                                                                    <span>Scheduled:</span>
                                                                    <span className="font-mono">{formatTime(scheduledMins)}</span>
                                                                </p>
                                                                <p className="text-cyan-400 text-xs flex justify-between gap-4">
                                                                    <span>Estimated:</span>
                                                                    <span className="font-mono">{formatTime(estimatedMins)}</span>
                                                                </p>
                                                                <div className="border-t border-slate-700 my-1"></div>
                                                                <p className={cn("text-xs font-bold text-right",
                                                                    estimatedMins > scheduledMins ? "text-red-400" : "text-green-400"
                                                                )}>
                                                                    {estimatedMins > scheduledMins ? `+${estimatedMins - scheduledMins} min Delay` : "On Time"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend />
                                        <ReferenceLine x={bus.routeStops[bus.currentStatus.currentStopIndex]?.name.substring(0, 10)} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Current', fill: '#ef4444', fontSize: 10 }} />
                                        <Line
                                            type="monotone"
                                            dataKey="Scheduled"
                                            stroke="#d8b4fe"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#d8b4fe' }}
                                            activeDot={{ r: 6 }}
                                            name="Scheduled Arrival"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="Estimated"
                                            stroke="#22d3ee"
                                            strokeDasharray="5 5"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#22d3ee' }}
                                            name="AI Estimated Arrival"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Comparison of published schedule vs real-time AI prediction
                            </p>
                        </div>

                        {/* Route Timeline */}
                        {bus.routeStops && (
                            <div className="px-6 pb-6 border-t border-white/5 pt-4">
                                <h4 className="text-purple-400 font-bold text-sm mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Full Route Journey
                                </h4>
                                <div className="relative">
                                    {/* Line */}
                                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-700"></div>

                                    <div className="max-h-40 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                        {bus.routeStops.map((stop: any, idx: number) => {
                                            const isPassed = idx < (bus.currentStatus.currentStopIndex || 0);
                                            const isCurrent = idx === (bus.currentStatus.currentStopIndex || 0);
                                            const isNext = idx === (bus.currentStatus.currentStopIndex || 0) + 1;

                                            return (
                                                <div key={idx} className="flex items-center gap-4 relative z-10">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors",
                                                        isCurrent ? "bg-cyan-500 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110" :
                                                            isPassed ? "bg-slate-800 border-slate-600 text-gray-500" :
                                                                "bg-slate-900 border-slate-700 text-gray-400"
                                                    )}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={cn("text-sm font-semibold", isCurrent ? "text-cyan-400" : "text-gray-300")}>
                                                            {stop.name}
                                                        </p>
                                                        {isCurrent && <p className="text-[10px] text-cyan-500 animate-pulse">BUS IS HERE</p>}
                                                        {isNext && <p className="text-[10px] text-purple-400">Next Stop ({bus.currentStatus.etaNextStop || '--'})</p>}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODALS */}
            {bookingStage === 'SEATS' && (
                <SeatSelectionModal
                    busId={bus.busId}
                    onClose={() => setBookingStage('NONE')}
                    onProceed={(seats) => {
                        setSelectedSeats(seats);
                        setBookingStage('PAY');
                    }}
                />
            )}

            {bookingStage === 'PAY' && (
                <PaymentModal
                    bus={bus}
                    selectedSeats={selectedSeats}
                    onClose={() => setBookingStage('NONE')}
                    onComplete={() => {
                        // Refresh bus data if needed
                    }}
                />
            )}
        </div>
    );
}
