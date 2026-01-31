"use client";

import { motion } from "framer-motion";
import { X, Phone, Mail, MessageSquare, Clock, ShieldCheck } from "lucide-react";

export default function HelpModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0f172a] border border-cyan-500/20 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            Customer Support
                        </h3>
                        <p className="text-slate-400 text-xs">We're here to help you 24/7</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center">
                                <Phone className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="text-xs text-slate-400">Call Us</span>
                            <span className="text-sm font-bold text-white">1800-123-456</span>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                                <Mail className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-xs text-slate-400">Email</span>
                            <span className="text-sm font-bold text-white">support@excel.com</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Common Topics</h4>
                        <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition border border-white/5 group">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm text-slate-200">Cancellation & Refunds</span>
                            </div>
                            <Clock className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition border border-white/5 group">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-slate-200">Safety+ Guidelines</span>
                            </div>
                            <Clock className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
                        </button>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20"
                        >
                            Close Support
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
