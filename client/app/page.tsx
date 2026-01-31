"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import SearchInterface from "@/components/SearchInterface";
import BusCard from "@/components/BusCard";
import HelpModal from "@/components/HelpModal";
import ManageBookingsModal from "@/components/ManageBookingsModal";
import { Loader2, Ticket, Bus, Star, Clock, ShieldCheck, User, LogOut } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({ from: "", to: "" });
  const [showHelp, setShowHelp] = useState(false);
  const [showManage, setShowManage] = useState(false);

  // AUTH STATE
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for logged in user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleSearch = async (from: string, to: string) => {
    setLoading(true);
    setSearched(true);
    setSearchParams({ from, to });
    try {
      const res = await axios.get("http://localhost:5001/api/buses", {
        params: { from, to }
      });
      setBuses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searched) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/buses", { params: searchParams });
        setBuses(res.data);
      } catch (err) { console.error(err); }
    }, 2000);
    return () => clearInterval(interval);
  }, [searched, searchParams]);

  return (
    <main className="min-h-screen bg-[#0f172a] font-sans text-slate-200 relative selection:bg-red-500/30">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-red-500/20 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Excel<span className="text-red-500">Bus</span></h1>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400 items-center">
            <button onClick={() => setShowHelp(true)} className="hover:text-white transition hidden md:block outline-none">Help</button>
            <button onClick={() => setShowManage(true)} className="hover:text-white transition hidden md:block outline-none">Manage Booking</button>

            {user ? (
              <div className="flex items-center gap-3 bg-slate-800/50 pr-4 py-1 pl-1 rounded-full border border-slate-700">
                <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-600" />
                <div className="text-left">
                  <p className="text-xs text-slate-400">Welcome,</p>
                  <p className="text-xs font-bold text-white leading-none">{user.name.split(' ')[0]}</p>
                </div>
                <button onClick={handleLogout} className="ml-2 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
              </div>
            ) : (
              <div
                onClick={() => router.push('/login')}
                className="flex items-center gap-2 text-white cursor-pointer hover:bg-slate-800 px-3 py-1.5 rounded-full transition border border-transparent hover:border-slate-700"
              >
                <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-xs">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
                <span>Login / Sign Up</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 pb-32 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 to-transparent pointer-events-none"></div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          India's No. 1 Online Bus Ticket Booking Site
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Search over 3000+ Bus Operators. Best Price Guaranteed.
        </p>

        {/* Search Widget Container */}
        <div className="w-full relative z-10">
          <SearchInterface onSearch={handleSearch} />
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-30 -mt-10">

        {/* BUS RESULTS SECTION */}
        {loading && (
          <div className="flex justify-center py-20 bg-slate-900/50 rounded-xl mb-10">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
          </div>
        )}

        {searched && !loading && (
          <div className="mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Available Buses <span className="text-slate-500 text-sm font-normal">({buses.length} Found)</span>
              </h3>
            </div>
            <div className="grid gap-6">
              {buses.map((bus: any) => (
                <BusCard key={bus._id} bus={bus} />
              ))}
            </div>
          </div>
        )}


        {/* TRENDING OFFERS (Excel Bus Style) */}
        {!searched && (
          <div className="mb-20">
            <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6">Trending Offers</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {[
                  { code: "FIRST", save: "Save up to ₹250", desc: "Valid on first booking" },
                  { code: "SUPER8", save: "Save up to ₹300", desc: "Valid on Super Luxury buses" },
                  { code: "BUS200", save: "Cashback ₹200", desc: "On min booking value ₹500" },
                  { code: "APSRTC", save: "10% OFF", desc: "On APSRTC Valid routes" },
                ].map((offer, i) => (
                  <div key={i} className="min-w-[280px] bg-gradient-to-br from-blue-900 to-slate-900 border border-blue-500/30 p-5 rounded-xl relative group cursor-pointer hover:border-blue-400 transition">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition"><Ticket className="w-16 h-16" /></div>
                    <div className="text-xs bg-white/10 text-white px-2 py-1 rounded w-fit mb-3">{offer.code}</div>
                    <h4 className="text-lg font-bold text-white mb-1">{offer.save}</h4>
                    <p className="text-sm text-slate-400">{offer.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL PARTNERS (Sponsors) */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white">Official Partners</h3>
            <button className="text-red-400 text-sm font-bold uppercase tracking-wider hover:text-red-300">View All</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['TSRTC', 'APSRTC', 'KSRTC', 'MSRTC', 'GSRTC'].map((rtc, i) => (
              <div key={i} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-red-500/50 p-6 rounded-xl flex flex-col items-center justify-center transition cursor-pointer group">
                <div className="w-12 h-12 bg-slate-700 rounded-full mb-3 group-hover:scale-110 transition flex items-center justify-center">
                  <Bus className="w-6 h-6 text-slate-400 group-hover:text-red-500" />
                </div>
                <span className="font-bold text-slate-300 group-hover:text-white">{rtc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY CHOOSE US (Primo) */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="text-center p-6">
            <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-4">
              <ShieldCheck className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Safety+</h4>
            <p className="text-slate-400 text-sm">With Safety+, we have brought in a set of measures to ensure you travel safely.</p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex p-4 rounded-full bg-indigo-500/10 mb-4">
              <Clock className="w-8 h-8 text-indigo-500" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">On-Time Guarantee</h4>
            <p className="text-slate-400 text-sm">We ensure punctual departures and arrivals. If updated, you get a refund!</p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex p-4 rounded-full bg-yellow-500/10 mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Primo Service</h4>
            <p className="text-slate-400 text-sm">Highly rated buses with best-in-class service and extra comfort.</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Bus className="w-6 h-6 text-red-500" />
              <span className="text-xl font-bold text-white">Excel Bus</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The world's largest online bus ticket booking service. Trusted by over 25 million happy customers globally.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">About</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-red-500 cursor-pointer">About Us</li>
              <li className="hover:text-red-500 cursor-pointer">Contact Us</li>
              <li className="hover:text-red-500 cursor-pointer">Mobile Version</li>
              <li className="hover:text-red-500 cursor-pointer">Sitemap</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">Global Sites</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-red-500 cursor-pointer">India</li>
              <li className="hover:text-red-500 cursor-pointer">Singapore</li>
              <li className="hover:text-red-500 cursor-pointer">Malaysia</li>
              <li className="hover:text-red-500 cursor-pointer">Indonesia</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">Partner</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-red-500 cursor-pointer">Goibibo</li>
              <li className="hover:text-red-500 cursor-pointer">Makemytrip</li>
              <li className="hover:text-red-500 cursor-pointer">Bus Hire</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          © 2026 Excel Bus Pvt Ltd. All rights reserved.
        </div>
      </footer>

      {/* MODALS */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showManage && <ManageBookingsModal user={user} onClose={() => setShowManage(false)} />}

    </main>
  );
}
