"use client";

import { useEffect, useState } from "react";
import { X, Check, Armchair, User } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Seat {
    number: number;
    status: 'AVAILABLE' | 'BOOKED_BY_USER' | 'OCCUPIED';
    isWindow: boolean;
}

export default function SeatSelectionModal({ busId, onClose, onProceed }: { busId: string, onClose: () => void, onProceed: (seats: number[]) => void }) {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/buses/${busId}/seats`);
                setSeats(res.data.seats);
            } catch (err) {
                console.error("Failed to load seats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSeats();
    }, [busId]);

    const toggleSeat = (seatNumber: number) => {
        const seat = seats.find(s => s.number === seatNumber);
        if (!seat || seat.status !== 'AVAILABLE') return;

        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
        } else {
            // Allow multiple selections
            setSelectedSeats([...selectedSeats, seatNumber]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Armchair className="w-5 h-5 text-cyan-400" /> Select Your Seats
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Seat Map */}
                <div className="p-6 bg-slate-900 relative">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center text-cyan-400">Loading Layout...</div>
                    ) : (
                        <div className="flex flex-col items-center">
                            {/* Driver Deck */}
                            <div className="w-full flex justify-end mb-6 pr-4 opacity-50">
                                <div className="w-8 h-8 rounded border border-gray-600 flex items-center justify-center">
                                    <span className="text-[10px] text-gray-500">Driver</span>
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-5 gap-3 mb-8">
                                {/* Columns: [Window] [Aisle] [Gap] [Aisle] [Window] */}
                                {/* We map 1-40. We need to render them in rows of 4. */}
                                {Array.from({ length: Math.ceil(seats.length / 4) }).map((_, rowIndex) => {
                                    const rowSeats = seats.slice(rowIndex * 4, (rowIndex + 1) * 4);

                                    return (
                                        <div key={rowIndex} className="contents">
                                            {/* Left Window */}
                                            <SeatIcon seat={rowSeats[0]} isSelected={selectedSeats.includes(rowSeats[0]?.number)} onToggle={toggleSeat} />
                                            {/* Left Aisle */}
                                            <SeatIcon seat={rowSeats[1]} isSelected={selectedSeats.includes(rowSeats[1]?.number)} onToggle={toggleSeat} />

                                            {/* Walking Aisle Gap */}
                                            <div className="w-4"></div>

                                            {/* Right Aisle */}
                                            <SeatIcon seat={rowSeats[2]} isSelected={selectedSeats.includes(rowSeats[2]?.number)} onToggle={toggleSeat} />
                                            {/* Right Window */}
                                            <SeatIcon seat={rowSeats[3]} isSelected={selectedSeats.includes(rowSeats[3]?.number)} onToggle={toggleSeat} />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="flex gap-4 text-xs text-gray-400 mb-6 bg-slate-800/40 p-3 rounded-lg">
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-700 rounded decoration-indigo-500"></div> Available</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-cyan-500 rounded"></div> Selected</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded"></div> Occupied</div>
                            </div>

                            <button
                                disabled={selectedSeats.length === 0}
                                onClick={() => onProceed(selectedSeats)}
                                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
                            >
                                {selectedSeats.length > 0
                                    ? `Proceed to Pay ₹${selectedSeats.length * 50} (${selectedSeats.length} ${selectedSeats.length === 1 ? 'Seat' : 'Seats'})`
                                    : 'Select Seats'}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function SeatIcon({ seat, isSelected, onToggle }: { seat: Seat, isSelected: boolean, onToggle: (n: number) => void }) {
    if (!seat) return <div className="w-8 h-8"></div>;

    const isAvailable = seat.status === 'AVAILABLE';
    const isOccupied = seat.status === 'OCCUPIED' || seat.status === 'BOOKED_BY_USER';

    return (
        <button
            onClick={() => onToggle(seat.number)}
            disabled={!isAvailable}
            className={`
                relative w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 border
                ${isSelected
                    ? "bg-cyan-500 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110 z-10"
                    : isOccupied
                        ? "bg-red-500/10 border-red-500/30 text-red-500/50 cursor-not-allowed"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700"
                }
            `}
        >
            <div className="flex flex-col items-center justify-center">
                <Armchair className={cn("w-5 h-5", isOccupied ? "opacity-30" : "opacity-100")} />
                <span className={cn(
                    "text-[10px] font-bold font-mono tracking-tighter -mt-1",
                    isSelected ? "text-white" : isOccupied ? "text-red-500/40" : "text-slate-300"
                )}>
                    {seat.number}
                </span>
            </div>
            {isOccupied && <User className="w-3 h-3 absolute top-1 right-1 opacity-40" />}
        </button>
    );
}
