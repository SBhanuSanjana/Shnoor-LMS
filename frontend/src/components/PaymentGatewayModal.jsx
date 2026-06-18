import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, Shield, AlertCircle } from 'lucide-react';

const PaymentGatewayModal = ({ isOpen, onClose, onSuccess, amount, planName }) => {
    const [step, setStep] = useState(1); 
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleProcessPayment = () => {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
            setError('Please fill all card details securely.');
            return;
        }
        if (cardDetails.number.replace(/\s/g, '').length < 16) {
            setError('Please enter a valid 16-digit card number.');
            return;
        }
        
        setError('');
        setStep(2);

       
        setTimeout(() => {
            setStep(3); 
            setTimeout(() => {
                onSuccess(); 
            }, 1200);
        }, 2500);
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i=0, len=match.length; i<len; i+=4) {
            parts.push(match.substring(i, i+4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-200">
                
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Secure Checkout</h3>
                        <p className="text-xs font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-emerald-500" />
                            256-bit SSL Encrypted
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{planName}</p>
                        <p className="text-2xl font-black text-blue-950">₹{amount}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-100">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                                <input 
                                    type="text" 
                                    placeholder="John Doe" 
                                    value={cardDetails.name}
                                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:font-medium placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Card Number</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="0000 0000 0000 0000" 
                                        maxLength="19"
                                        value={cardDetails.number}
                                        onChange={(e) => setCardDetails({...cardDetails, number: formatCardNumber(e.target.value)})}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:font-medium placeholder:text-slate-400 tracking-widest"
                                    />
                                    <CreditCard className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY" 
                                        maxLength="5"
                                        value={cardDetails.expiry}
                                        onChange={(e) => setCardDetails({...cardDetails, expiry: formatExpiry(e.target.value)})}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:font-medium placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVC/CVV</label>
                                    <input 
                                        type="password" 
                                        placeholder="•••" 
                                        maxLength="4"
                                        value={cardDetails.cvc}
                                        onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:font-medium placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                            <div className="w-16 h-16 relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                                <Lock className="w-6 h-6 text-blue-500" />
                            </div>
                            <h4 className="text-lg font-black text-slate-800">Processing Payment...</h4>
                            <p className="text-xs font-medium text-slate-500 mt-2 max-w-[250px]">Authenticating securely with your bank. Please do not close this window.</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 scale-in">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h4 className="text-lg font-black text-slate-800">Payment Successful!</h4>
                            <p className="text-xs font-medium text-slate-500 mt-2">Your subscription has been securely activated.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 1 && (
                    <div className="p-6 border-t border-slate-100 bg-white flex flex-col gap-3">
                        <button 
                            onClick={handleProcessPayment}
                            className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_15px_-3px_rgba(23,37,84,0.3)] flex items-center justify-center gap-2"
                        >
                            <Lock className="w-4 h-4" />
                            Pay ₹{amount} Securely
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full text-slate-500 hover:text-slate-800 font-bold py-2 text-sm transition-colors"
                        >
                            Cancel Payment
                        </button>
                        <div className="flex justify-center gap-2 mt-2 opacity-50">
                            {/* Dummy payment logos for realism */}
                            <div className="h-6 w-10 bg-slate-200 rounded"></div>
                            <div className="h-6 w-10 bg-slate-200 rounded"></div>
                            <div className="h-6 w-10 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentGatewayModal;
