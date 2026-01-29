"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import SearchInterface from "@/components/SearchInterface";
import BusCard from "@/components/BusCard";
import { Loader2, Server, Globe, ShieldCheck } from "lucide-react";

export default function Home() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bookingBus, setBookingBus] = useState<any>(null);

  const [searchParams, setSearchParams] = useState({ from: "", to: "" });

  const handleSearch = async (from: string, to: string) => {
    setLoading(true);
    setSearched(true);
    setSearchParams({ from, to }); // Store for polling
    try {
      // Pass query params to backend for filtering
      const res = await axios.get("http://localhost:5000/api/buses", {
        params: { from, to }
      });
      setBuses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Poll for updates if searched
  useEffect(() => {
    if (!searched) return;
    const interval = setInterval(async () => {
      try {
        // Use stored params for polling to keep filters active
        const res = await axios.get("http://localhost:5000/api/buses", {
          params: searchParams
        });
        setBuses(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [searched, searchParams]);

  return (
    <main className="min-h-screen bg-[#050508] font-sans text-slate-200 relative">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0"></div>

      {/* Header / Status Bar */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h1 className="text-lg font-bold tracking-widest text-white uppercase">Transit<span className="text-cyan-500">OS</span></h1>
          </div>
          <div className="flex gap-6 text-xs font-mono text-gray-500">
            <div className="flex items-center gap-2">
              <Server className="w-3 h-3" /> SYSTEM: ONLINE
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" /> NETWORK: 5G
            </div>
            <div className="flex items-center gap-2 text-green-500/80">
              <ShieldCheck className="w-3 h-3" /> SECURE
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-24 flex flex-col items-center justify-center text-center px-4">
        <div className="inline-block px-3 py-1 mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono tracking-widest uppercase">
          v2.0 Digital Twin Active
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 mb-6 tracking-tight">
          CITY<span className="text-cyan-500">FLOW</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Advanced urban mobility analytics. Real-time fleet tracking, AI-powered prediction, and seamless booking integration.
        </p>
      </section>

      {/* Search & Content */}
      <div className="relative z-10 pb-20 px-4">
        <SearchInterface onSearch={handleSearch} />

        {loading && (
          <div className="flex justify-center mt-20">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          </div>
        )}

        {searched && !loading && (
          <div className="max-w-6xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <h3 className="text-xl font-mono text-cyan-400 flex items-center gap-3">
                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                ACTIVE_FLEET_DETECTED
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {buses.length} UNITS TRACKING
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {buses.map((bus: any) => (
                <BusCard key={bus._id} bus={bus} />
              ))}
            </div>

            {buses.length === 0 && (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                <p className="text-slate-500 font-mono">NO UNITS FOUND ON THIS ROUTE // TRY OTHER COORDINATES</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
