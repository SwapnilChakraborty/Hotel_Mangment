import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { API_URL } from '../config/api';

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const { socket } = useSocket();
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
        if (isOpen && socket) {
            fetch(`${API_URL}/api/chat/${roomNumber}`)
                .then(res => res.json())
                .then(data => setMessages(Array.isArray(data) ? data : []))
                .catch(err => {
                    console.error('Error fetching chat history:', err);
                    setMessages([]);
                });

            socket.emit('join_room', roomNumber);
            socket.on('new_message', (msg) => {
                if (msg) setMessages(prev => [...prev, msg]);
            });

            return () => {
                socket.off('new_message');
            };
        }
    }, [isOpen, roomNumber, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !socket) return;
        socket.emit('guest_send_message', { roomNumber, text: input });
        setInput('');
    };

    return (
        <div className="fixed bottom-24 right-6 z-[100]">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white w-80 h-[28rem] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <MessageSquare size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold leading-none">Guest Relations</p>
                                    <p className="text-[10px] text-white/60 mt-1">Typical reply time: 2 mins</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                                <Minus size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <MessageSquare size={32} className="mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">How can we help?</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isGuest = msg?.sender === 'guest';
                                    return (
                                        <div key={msg?._id || idx} className={`flex ${isGuest ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-2.5 rounded-2xl text-xs font-medium shadow-sm ${
                                                isGuest
                                                ? 'bg-primary text-white rounded-tr-none' 
                                                : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                                            }`}>
                                                {msg?.text || ''}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-slate-100 bg-white">
                            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1 border border-slate-100">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent py-2 text-xs outline-none font-medium"
                                />
                                <button onClick={handleSend} disabled={!input.trim()} className="text-primary disabled:opacity-30">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/30"
                    >
                        <MessageSquare size={24} fill="white" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
