"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ticket, Calendar, MapPin, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

export default function ManageBookingsModal({ onClose, user }: { onClose: () => void, user: any }) {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchBookings = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/bookings");
                // In a real app, we would filter by user. For demo, we show everything relevant
                setBookings(res.data);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0f172a] border border-red-500/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[80vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            Manage Your Bookings
                        </h3>
                        <p className="text-slate-400 text-xs">View and track your upcoming journeys</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {!user ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">Login Required</h4>
                            <p className="text-slate-400 max-w-xs mx-auto mb-6">Please login to view and manage your bus ticket bookings.</p>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition"
                            >
                                Back to Home
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-4" />
                            <p className="text-slate-400">Loading your journeys...</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Ticket className="w-8 h-8 text-slate-400" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">No Bookings Found</h4>
                            <p className="text-slate-400 max-w-xs mx-auto">You haven't booked any tickets yet. Ready for a trip?</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {bookings.map((booking) => (
                                <motion.div
                                    key={booking._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-slate-800/40 border border-white/5 rounded-2xl p-5 hover:border-red-500/30 transition flex flex-col md:flex-row gap-6 relative group overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rotate-45 translate-x-6 -translate-y-6"></div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-red-500/20 p-2 rounded-lg">
                                                    <Ticket className="w-4 h-4 text-red-500" />
                                                </div>
                                                <span className="text-xs font-mono text-slate-500">{booking.ticketId}</span>
                                            </div>
                                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full font-bold">Confirmed</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Bus ID</p>
                                                <p className="text-sm font-bold text-white">{booking.busId || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Seats</p>
                                                <p className="text-sm font-bold text-red-400">{booking.seatNumbers.join(", ")}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:w-px bg-white/5"></div>

                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm text-slate-300 font-medium">
                                                    {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm text-slate-300 font-medium">Digital Ticket Only</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="md:w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl hover:bg-red-500 hover:text-white transition group">
                                        <Ticket className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white/5 border-t border-white/5 shrink-0">
                    <p className="text-center text-xs text-slate-500 mb-4">
                        For cancellations and rescheduling, please contact support.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
                    >
                        Close Manager
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
