import React, { useState, useEffect } from 'react';
import { Key, Wifi, Utensils, MessageSquare, Briefcase, Car, Sparkles, MoreHorizontal, Sun, Calendar, Clock, MapPin, Activity, CheckCircle2, Clock as ClockIcon, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

export function GuestHome() {
    const customer = JSON.parse(localStorage.getItem('customer') || '{}');
    const guestName = customer.name || 'Anderson';
    const roomNumber = (customer.room?.roomNumber || customer.room || '402').toString();
    const { socket } = useSocket();
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/guest-activity/${roomNumber}`)
            .then(res => res.json())
            .then(data => setActivities(data))
            .catch(err => console.error('Error fetching activities:', err));

        if (socket) {
            socket.emit('join_room', roomNumber);

            socket.on('status_updated', (data) => {
                setActivities(prev => prev.map(act =>
                    act.id === data.requestId ? { ...act, status: data.status } : act
                ));
            });

            socket.on('admin_activity', (data) => {
                // If it's related to this room
                if (data.room === roomNumber) {
                    setActivities(prev => [{
                        id: data.id,
                        text: data.type === 'order' ? `Order #${data.id.toString().substr(-5)}` : `${data.details}`,
                        time: data.time || new Date(),
                        type: data.type,
                        status: data.status || 'Pending'
                    }, ...prev].slice(0, 10)); // Keep last 10
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('status_updated');
                socket.off('admin_activity');
            }
        };
    }, [roomNumber, socket]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000 bg-[#f4f1ea] min-h-screen">
            {/* Hero Section with Elegant Styling */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[28rem] w-full rounded-none overflow-hidden shadow-md group"
            >
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop"
                    alt="Hotel Hero"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a221a]/90 via-[#2a221a]/30 to-transparent flex flex-col justify-end p-10 pb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 bg-[#f4f1ea]/10 backdrop-blur-sm border border-[#ab9373]/40 px-4 py-1.5 rounded-none w-fit mb-6"
                    >
                        <span className="w-1.5 h-1.5 bg-[#ab9373] rounded-full animate-pulse shadow-[0_0_8px_#ab9373]"></span>
                        <span className="text-[10px] font-sans text-white uppercase tracking-[0.2em]">Active Residency</span>
                    </motion.div>
                    <h1 className="text-5xl font-serif text-[#f4f1ea] leading-[1.1] font-normal">
                        Welcome, <br />
                        <span className="italic text-[#ab9373]">Mr. {guestName.split(' ')[0]}</span>
                    </h1>
                    <p className="text-[#f4f1ea]/80 font-sans mt-5 text-xs flex items-center gap-2 uppercase tracking-[0.2em]">
                        <MapPin size={14} className="text-[#ab9373]" /> Vishnu Suites
                    </p>
                </div>
            </motion.div>

            {/* Premium Status Row */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="px-6">
                <div className="grid grid-cols-3 divide-x divide-[#ab9373]/20 border border-[#ab9373]/20 bg-[#fdfdfc] shadow-sm">
                    <StatusItem label="YOUR ROOM" value={roomNumber} icon={<Key size={14} className="text-[#5a4634]" />} />
                    <StatusItem label="CHECKOUT" value="Oct 24" icon={<Calendar size={14} className="text-[#5a4634]" />} />
                    <StatusItem label="WEATHER" value="72°F" subValue="SUNNY" icon={<Sun size={14} className="text-[#8b7355]" />} />
                </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <div className="flex justify-between items-center px-6">
                    <h3 className="text-2xl font-serif text-[#4a3b2c] capitalize">Signature Services</h3>
                    <div className="flex items-center gap-2 border border-[#ab9373] px-3 py-1.5 rounded-none">
                        <Clock size={10} className="text-[#5a4634]" />
                        <span className="text-[9px] font-sans font-medium text-[#5a4634] uppercase tracking-widest">Available 24/7</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 px-6 font-sans">
                    <QuickAction icon={<Key size={22} />} label="Digital Key" delay={0.1} />
                    <QuickAction icon={<Wifi size={22} />} label="Fast Wi-Fi" delay={0.2} />
                    <QuickAction icon={<Utensils size={22} />} label="Dining" to="/guest/services" delay={0.3} />
                    <QuickAction icon={<MessageSquare size={22} />} label="Concierge" to="/guest/chat" delay={0.4} />
                    <QuickAction icon={<Briefcase size={22} />} label="Laundry" delay={0.5} />
                    <QuickAction icon={<Car size={22} />} label="Valet" delay={0.6} />
                    <QuickAction icon={<Sparkles size={22} />} label="Wellness" to="/guest/amenities" delay={0.7} />
                    <QuickAction icon={<MoreHorizontal size={22} />} label="Support" delay={0.8} />
                </div>
            </motion.div>

            {/* Curated Experiences */}
            <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6"
            >
                <div className="flex justify-between items-center px-6">
                    <h3 className="text-2xl font-serif text-[#4a3b2c] capitalize">Curated For You</h3>
                </div>
                <div className="space-y-6 px-6">
                    <PromoCard
                        tag="GASTRONOMY"
                        title="Azure Fine Dining"
                        sub="Experience Michelin-star seafood with ocean views"
                        image="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop"
                    />
                    <PromoCard
                        tag="EXPLORATION"
                        title="Island Discovery"
                        sub="Private yacht tours departing from the resort dock"
                        image="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop"
                    />
                </div>
            </motion.div>
            {/* Live Feed Section */}
            <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6"
            >
                <div className="flex justify-between items-center px-6 border-b border-[#ab9373]/20 pb-4">
                    <h3 className="text-2xl font-serif text-[#4a3b2c] capitalize flex items-center gap-2">
                        <Activity size={18} className="text-[#8b7355]" />
                        Live Updates
                    </h3>
                    <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b7355] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8b7355]"></span>
                    </span>
                </div>

                <div className="px-6">
                    <div className="p-1 border border-[#ab9373]/20 bg-[#fdfdfc] shadow-sm overflow-hidden rounded-none">
                        <div className="flex flex-col max-h-64 overflow-y-auto custom-scrollbar p-1">
                            <AnimatePresence>
                                {activities.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-8 text-center"
                                    >
                                        <div className="w-10 h-10 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                            <TrendingUp size={16} className="text-slate-300" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">No recent activity</p>
                                        <p className="text-[10px] text-slate-400 opacity-60 mt-1">Orders and requests will appear here</p>
                                    </motion.div>
                                ) : (
                                    activities.map((activity, idx) => (
                                        <ActivityItem
                                            key={activity.id || idx}
                                            activity={activity}
                                            isLast={idx === activities.length - 1}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>

        </div>
    );
}

function StatusItem({ label, value, subValue, icon }) {
    return (
        <div className="flex flex-col items-center justify-center p-6 text-center transition-all bg-white hover:bg-[#faf9f6] cursor-pointer group">
            <span className="text-[10px] font-sans text-[#ab9373] tracking-[0.2em] mb-2 uppercase">{label}</span>
            <div className="flex items-center gap-2">
                <div className="p-1.5 border border-[#e8e4d9] rounded-none group-hover:bg-[#f4f1ea] transition-colors">
                    {icon}
                </div>
                <span className="text-xl font-serif text-[#4a3b2c]">{value}</span>
            </div>
            {subValue && <span className="text-[9px] font-sans text-[#ab9373] tracking-[0.1em] mt-1.5 uppercase">{subValue}</span>}
        </div>
    );
}

function QuickAction({ icon, label, to = "#", delay }) {
    return (
        <motion.button
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
            }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -2 }}
            className="flex flex-col items-center justify-center gap-4 p-5 bg-[#fdfdfc] border border-[#e8e4d9] shadow-sm rounded-none transition-all hover:shadow-md hover:border-[#ab9373] group"
        >
            <div className="p-3 bg-transparent border border-[#e8e4d9] text-[#5a4634] rounded-none group-hover:bg-[#5a4634] group-hover:text-white transition-colors duration-300">
                {icon}
            </div>
            <span className="text-[10px] font-sans text-[#8b7355] uppercase tracking-widest group-hover:text-[#5a4634] transition-colors">{label}</span>
        </motion.button>
    );
}

function PromoCard({ tag, title, sub, image }) {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative h-48 w-full rounded-none overflow-hidden group cursor-pointer border border-[#ab9373]/20 shadow-sm"
        >
            <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[#f4f1ea]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2a221a]/90 via-[#2a221a]/60 to-transparent flex flex-col justify-center p-8 w-3/4">
                <span className="text-[10px] font-sans text-[#ab9373] tracking-[0.2em] mb-3 uppercase">{tag}</span>
                <h4 className="text-3xl font-serif text-[#f4f1ea] leading-tight font-normal">{title}</h4>
                <p className="text-xs text-[#f4f1ea]/80 font-sans mt-3 leading-relaxed">{sub}</p>
                <div className="mt-5 flex items-center gap-2 text-[10px] font-sans text-[#ab9373] uppercase tracking-widest group-hover:gap-3 transition-all border border-[#ab9373] w-fit px-4 py-2 hover:bg-[#ab9373] hover:text-white">
                    Explore <ArrowRightIcon className="w-3 h-3" />
                </div>
            </div>
        </motion.div>
    );
}

function ArrowRightIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    );
}

function ActivityItem({ activity, isLast }) {
    const isCompleted = activity.status.toLowerCase() === 'completed' || activity.status.toLowerCase() === 'delivered';
    const isPending = activity.status.toLowerCase() === 'pending' || activity.status.toLowerCase() === 'new';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex gap-4 p-4 transition-colors hover:bg-[#f4f1ea]/50 ${!isLast ? 'border-b border-[#e8e4d9]' : ''}`}
        >
            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-none border flex items-center justify-center
                ${isCompleted ? 'border-[#8b7355] text-[#8b7355] bg-transparent' :
                    isPending ? 'border-[#ab9373] text-[#ab9373] bg-transparent' : 'border-[#5a4634] text-[#5a4634] bg-transparent'}`}
            >
                {isCompleted ? <CheckCircle2 size={14} /> :
                    isPending ? <ClockIcon size={14} /> : <TrendingUp size={14} />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-sans font-medium text-[#4a3b2c] truncate">{activity.text}</p>
                    <span className="text-[10px] font-sans text-[#ab9373] whitespace-nowrap ml-2 mt-1">
                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[9px] font-sans uppercase tracking-widest px-2 py-0.5 border inline-flex items-center gap-1
                         ${isCompleted ? 'border-[#8b7355]/30 text-[#8b7355]' :
                            isPending ? 'border-[#ab9373]/30 text-[#ab9373]' : 'border-[#5a4634]/30 text-[#5a4634]'}`}
                    >
                        {activity.status}
                    </span>
                    <span className="text-[10px] font-sans text-[#8b7355] capitalize italic">
                        • {activity.type}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
