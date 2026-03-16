import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

export function GuestChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const getCustomerSafe = () => {
        try {
            return JSON.parse(localStorage.getItem('customer') || '{}');
        } catch (e) {
            console.error('Failed to parse customer from localStorage', e);
            return {};
        }
    };

    const customer = getCustomerSafe();
    const roomNumber = (customer.room?.roomNumber || customer.room || '402').toString();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        
        // Fetch History
        fetch(`${API_URL}/api/chat/${roomNumber}`)
            .then(res => res.json())
            .then(data => {
                setMessages(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching chat history:', err);
                setMessages([]);
                setLoading(false);
            });

        if (socket) {
            socket.emit('join_room', roomNumber);
            
            socket.on('new_message', (msg) => {
                if (msg) setMessages(prev => [...prev, msg]);
            });
        }

        return () => {
            if (socket) {
                socket.off('new_message');
            }
        };
    }, [roomNumber, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !socket) return;
        
        socket.emit('guest_send_message', {
            roomNumber,
            text: input
        });
        
        setInput('');
    };

    const formatTimeSafe = (timeStr) => {
        try {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) return 'Now';
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return 'Now';
        }
    };

    return (
        <div className="h-[calc(100vh-10rem)] flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-50 flex items-center gap-3 bg-white">
                <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-50 rounded-full">
                    <ArrowLeft size={20} className="text-slate-400" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            RS
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-primary leading-none">Guest Relations</p>
                        <p className="text-[10px] text-green-600 font-bold uppercase mt-1">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading conversation...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Send size={24} className="text-slate-200" />
                        </div>
                        <h3 className="text-primary font-bold">Start a Conversation</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Our team is here to help with any requests or questions.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isGuest = msg?.sender === 'guest';
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg?._id || idx}
                                className={`flex ${isGuest ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${isGuest
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                                    }`}>
                                    <p className="text-sm font-medium">{msg?.text || ''}</p>
                                    <p className={`text-[9px] mt-1 font-bold ${isGuest ? 'text-white/50' : 'text-slate-300'}`}>
                                        {formatTimeSafe(msg?.timestamp)}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-1 border border-slate-100">
                    <button className="text-slate-400 hover:text-slate-600"><Paperclip size={18} /></button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Need anything? Just ask us..."
                        className="flex-1 bg-transparent py-3 text-sm outline-none font-medium"
                    />
                    <button
                        onClick={handleSend}
                        className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/10"
                        disabled={!input.trim()}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
