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
                const res = await axios.get("http://localhost:5000/api/stops");
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
        <div className="relative -mt-10 max-w-4xl mx-auto z-20">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl">
                <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr,1fr,auto] gap-4">

                    {/* Datalist for Autocomplete */}
                    <datalist id="city-stops">
                        {stops.map((stop) => (
                            <option key={stop} value={stop} />
                        ))}
                    </datalist>

                    <div className="relative group">
                        <div className="absolute left-4 top-4 text-cyan-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            list="city-stops"
                            placeholder="From Location (e.g. Secunderabad)"
                            className="w-full bg-slate-900/80 text-white pl-12 pr-4 py-4 rounded-xl border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-4 top-4 text-purple-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            list="city-stops"
                            placeholder="Destination (e.g. Hitech City)"
                            className="w-full bg-slate-900/80 text-white pl-12 pr-4 py-4 rounded-xl border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        Search Buses
                    </button>
                </form>
            </div>
        </div>
    );
}
