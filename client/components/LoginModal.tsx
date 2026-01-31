"use client";

import { useState } from "react";
import { X, Smartphone, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal({ onClose, onLoginSuccess }: any) {
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        setLoading(false);
        setStep('OTP');
        // Auto-fill OTP for demo convenience
        setTimeout(() => setOtp("4821"), 500);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5001/api/login", { phone, otp });
            // Simulate delay
            await new Promise(r => setTimeout(r, 1000));
            onLoginSuccess(res.data.user);
            onClose();
        } catch (err) {
            alert("Login Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col md:flex-row h-[500px]"
            >
                {/* Left Banner (Excel Bus style) */}
                <div className="hidden md:flex w-2/5 bg-red-100 flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-10"></div>
                    <img
                        src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?w=740"
                        alt="Login"
                        className="w-32 h-32 mb-4 mix-blend-multiply"
                    />
                    <h3 className="text-slate-800 font-bold text-lg">Unlock Benefits</h3>
                    <p className="text-slate-500 text-xs mt-2">Get access to exclusive offers, track you bus and manage bookings.</p>
                </div>

                {/* Right Form */}
                <div className="flex-1 p-8 relative bg-white">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">
                            {step === 'PHONE' ? 'Sign in to Excel Bus' : 'Verify OTP'}
                        </h2>

                        <AnimatePresence mode="wait">
                            {step === 'PHONE' ? (
                                <motion.form
                                    key="phone"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleSendOtp}
                                >
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mobile Number</label>
                                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition mb-6">
                                        <div className="bg-slate-50 px-3 py-3 border-r border-slate-300 text-slate-600 font-medium">+91</div>
                                        <input
                                            required
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="flex-1 px-4 py-3 text-slate-900 font-medium outline-none"
                                            placeholder="Enter your mobile"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || phone.length < 10}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Generate OTP <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="otp"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleVerifyOtp}
                                >
                                    <p className="text-sm text-slate-500 mb-6">
                                        We've sent a code to <span className="font-bold text-slate-900">+91 {phone}</span>
                                        <button type="button" onClick={() => setStep('PHONE')} className="text-red-500 ml-2 text-xs font-bold hover:underline">Edit</button>
                                    </p>

                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enter OTP</label>
                                    <input
                                        required
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 font-bold text-center tracking-[1em] text-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none mb-6"
                                        placeholder="••••"
                                        maxLength={4}
                                    />

                                    <button
                                        type="submit"
                                        disabled={loading || otp.length < 4}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify OTP <CheckCircle className="w-4 h-4" /></>}
                                    </button>

                                    <div className="text-center mt-4">
                                        <p className="text-xs text-slate-400">Auto-filling OTP for demo...</p>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
