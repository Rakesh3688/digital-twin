"use client";

import { useState } from "react";
import { X, CreditCard, CheckCircle, Ticket, Smartphone, QrCode, Building, Loader2 } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type PaymentMethod = 'UPI' | 'CARD' | 'QR' | 'NETBANKING';

export default function PaymentModal({ bus, selectedSeats, onClose, onComplete }: any) {
    const [step, setStep] = useState<'PAY' | 'SUCCESS'>('PAY');
    const [method, setMethod] = useState<PaymentMethod>('UPI');
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [ticketData, setTicketData] = useState<any>(null);

    const amount = selectedSeats.length * 50; // Mock Fare

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate network delay for realism
        await new Promise(r => setTimeout(r, 2000));

        try {
            const res = await axios.post("http://localhost:5000/api/bookings", {
                busId: bus.busId,
                seatNumbers: selectedSeats,
                customerName: name || "Guest User",
                amount
            });

            setTicketData(res.data);
            setStep('SUCCESS');
        } catch (err) {
            alert("Payment Failed");
        } finally {
            setLoading(false);
        }
    };

    if (step === 'SUCCESS') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white text-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
                >
                    <div className="bg-emerald-500 h-32 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        <CheckCircle className="w-16 h-16 text-white animate-bounce relative z-10" />
                    </div>
                    <div className="p-8 text-center -mt-10 relative z-10">
                        <div className="bg-white p-2 rounded-full inline-block shadow-lg mb-4">
                            <Ticket className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Payment Successful!</h2>
                        <p className="text-gray-500 text-sm mb-6">Your seat has been reserved.</p>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-left space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-xs uppercase font-bold">Passenger</span>
                                <span className="font-bold text-slate-900">{name || "Guest"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-xs uppercase font-bold">Bus Route</span>
                                <span className="font-mono font-bold text-slate-900">{bus.routeId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-xs uppercase font-bold">Seats</span>
                                <span className="font-bold text-emerald-600">{selectedSeats.join(", ")}</span>
                            </div>
                            <div className="border-t border-slate-200 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs uppercase font-bold">Total Paid</span>
                                <span className="font-bold text-xl text-slate-900">₹{amount}</span>
                            </div>
                        </div>

                        {/* QR Placeholder */}
                        <div className="bg-white border-2 border-dashed border-gray-300 p-4 rounded-lg mb-6 flex flex-col items-center">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketData?.ticketId}`}
                                alt="Ticket QR"
                                className="w-32 h-32 mix-blend-multiply"
                            />
                            <span className="text-[10px] text-gray-400 mt-2 font-mono">{ticketData?.ticketId}</span>
                        </div>

                        <button onClick={() => { onComplete(); onClose(); }} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg hover:shadow-xl">
                            Download Ticket
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f172a] border border-cyan-500/20 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            Secure Payment
                        </h3>
                        <p className="text-slate-400 text-xs">Transaction ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <div className="flex min-h-[400px]">
                    {/* Sidebar Tabs */}
                    <div className="w-1/3 bg-slate-900/50 border-r border-white/5 p-2 space-y-2">
                        <PaymentTab
                            active={method === 'UPI'}
                            onClick={() => setMethod('UPI')}
                            icon={Smartphone}
                            label="UPI / Apps"
                        />
                        <PaymentTab
                            active={method === 'CARD'}
                            onClick={() => setMethod('CARD')}
                            icon={CreditCard}
                            label="Credit / Debit"
                        />
                        <PaymentTab
                            active={method === 'QR'}
                            onClick={() => setMethod('QR')}
                            icon={QrCode}
                            label="Scan QR"
                        />
                        <PaymentTab
                            active={method === 'NETBANKING'}
                            onClick={() => setMethod('NETBANKING')}
                            icon={Building}
                            label="Net Banking"
                        />
                    </div>

                    {/* Content Area */}
                    <div className="w-2/3 p-6 bg-slate-900 relative">
                        <div className="mb-6">
                            <label className="block text-xs uppercase text-cyan-500 font-bold mb-1 tracking-wider">Amount to Pay</label>
                            <div className="text-3xl font-bold text-white">₹{amount}.00</div>
                        </div>

                        <form onSubmit={handlePay} className="space-y-6">

                            {/* Common Name Field */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Passenger Name</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 transition"
                                    placeholder="Enter Name"
                                />
                            </div>

                            <div className="min-h-[120px]">
                                {method === 'UPI' && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <label className="block text-xs text-slate-400 mb-1">Enter UPI ID</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                                                placeholder="username@bank"
                                            />
                                            <button type="button" className="px-3 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-lg hover:bg-cyan-500/20">Verify</button>
                                        </div>
                                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                            {/* Mock App Icons */}
                                            {['GPay', 'PhonePe', 'Paytm'].map(app => (
                                                <div key={app} className="min-w-[60px] h-[60px] bg-slate-800 rounded-xl flex items-center justify-center text-[10px] text-slate-400 border border-slate-700 hover:border-cyan-500 cursor-pointer transition">
                                                    {app}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {method === 'CARD' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <input type="text" placeholder="Card Number" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                                        <div className="flex gap-3">
                                            <input type="text" placeholder="MM/YY" className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                                            <input type="password" placeholder="CVV" className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                                        </div>
                                    </div>
                                )}

                                {method === 'QR' && (
                                    <div className="text-center animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="bg-white p-2 rounded-lg inline-block mx-auto mb-2">
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=mock@upi&pn=CityTransit&am=${amount}`} alt="QR" className="w-24 h-24" />
                                        </div>
                                        <p className="text-[10px] text-cyan-400 animate-pulse">Scan with any UPI App to Pay</p>
                                    </div>
                                )}

                                {method === 'NETBANKING' && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <label className="block text-xs text-slate-400 mb-1">Select Bank</label>
                                        <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                                            <option>HDFC Bank</option>
                                            <option>SBI</option>
                                            <option>ICICI Bank</option>
                                            <option>Axis Bank</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !name}
                                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Make Payment</span>
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">₹{amount}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function PaymentTab({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            type="button"
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                active
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </button>
    )
}
