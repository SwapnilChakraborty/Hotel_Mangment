import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QrCode, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

export function QRLanding() {
    const navigate = useNavigate();
    const { roomId } = useParams();

    return (
        <div className="min-h-screen bg-[#f4f1ea] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto animate-in fade-in duration-1000">
            <Logo className="mb-12 scale-125 text-[#4a3b2c]" />

            <div className="relative mb-10">
                <div className="w-32 h-32 border-2 border-[#ab9373]/30 rounded-none flex items-center justify-center bg-[#fdfdfc] shadow-sm">
                    <QrCode size={56} strokeWidth={1.5} className="text-[#5a4634]" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#ab9373] rounded-none flex items-center justify-center text-white shadow-md">
                    <Sparkles size={18} />
                </div>
            </div>

            <h1 className="text-4xl font-serif text-[#4a3b2c] mb-5 font-normal tracking-wide">
                Welcome to Room <span className="italic text-[#8b7355]">{roomId || '402'}</span>
            </h1>
            <p className="text-[#5a4634]/80 mb-12 leading-relaxed font-sans max-w-[280px]">
                Experience seamless hospitality. Scan, request, and enjoy your stay without lifting a finger.
            </p>

            <div className="w-full space-y-5">
                <Button
                    onClick={() => navigate('/guest')}
                    className="w-full py-5 text-sm uppercase tracking-widest font-serif rounded-none transition-all border border-[#ab9373] text-[#f4f1ea] bg-[#5a4634] hover:bg-[#4a3b2c] flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-[#5a4634]/10"
                >
                    Enter Room Dashboard
                    <ArrowRight size={18} />
                </Button>

                <div className="flex items-center justify-center gap-2 text-[#ab9373] text-sm mt-8 pb-4 font-sans">
                    <ShieldCheck size={16} />
                    <span>Secure & Contactless Check-in</span>
                </div>
            </div>

            {/* Elegant decoration */}
            <div className="fixed bottom-0 left-0 w-full h-1.5 bg-[#4a3b2c]"></div>
        </div>
    );
}
