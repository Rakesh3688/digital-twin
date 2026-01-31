"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin } from "lucide-react";

export default function SearchInterface({ onSearch }: { onSearch: (from: string, to: string) => void }) {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [stops, setStops] = useState<string[]>([]);

    useEffect(() => {
        // Fetch all available stops for autocomplete
        const fetchStops = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/stops");
                setStops(res.data);
            } catch (err) {
                console.error("Failed to fetch stops", err);
                // Fallbacks if server not ready
                setStops([
                    "Secunderabad Stn", "Hitech City", "Uppal X Roads", "Lingampally", "Koti", "RGIA Airport",
                    "Ameerpet", "Kukatpally", "Miyapur", "LB Nagar", "Patancheru", "Gachibowli", "JBS", "Mehdipatnam"
                ].sort());
            }
        };
        fetchStops();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
            alert("Source and Destination cannot be the same! Please change one.");
            return;
        }
        onSearch(from, to);
    };

    return (
        <div className="relative max-w-5xl mx-auto px-4">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-2 md:p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-stretch gap-2">

                    {/* Datalist for Autocomplete */}
                    <datalist id="city-stops">
                        {stops.map((stop) => (
                            <option key={stop} value={stop} />
                        ))}
                    </datalist>

                    <div className="flex-1 relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors z-10">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            list="city-stops"
                            placeholder="From Location"
                            className="w-full bg-slate-800/40 text-white pl-14 pr-6 py-5 rounded-2xl border border-white/5 focus:border-cyan-500/50 focus:bg-slate-800/60 outline-none transition-all placeholder:text-slate-500 font-medium"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            required
                        />
                    </div>

                    <div className="hidden md:flex items-center justify-center px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer rotate-90 md:rotate-0">
                            <Search className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex-1 relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-500/50 group-focus-within:text-purple-400 transition-colors z-10">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            list="city-stops"
                            placeholder="To Destination"
                            className="w-full bg-slate-800/40 text-white pl-14 pr-6 py-5 rounded-2xl border border-white/5 focus:border-purple-500/50 focus:bg-slate-800/60 outline-none transition-all placeholder:text-slate-500 font-medium"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-5 px-10 rounded-2xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3 group"
                    >
                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="whitespace-nowrap">Search Buses</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
