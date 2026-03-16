import React, { useState, useEffect } from 'react';
import { Key, Wifi, Utensils, MessageSquare, Briefcase, Car, Sparkles, MoreHorizontal, Sun, Calendar, Clock, MapPin, Activity, CheckCircle2, Clock as ClockIcon, TrendingUp, HandPlatter, SprayCan, PhoneCall, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { Link, useNavigate } from 'react-router-dom';

export function GuestHome() {
    const getCustomerSafe = () => {
        try {
            return JSON.parse(localStorage.getItem('customer') || '{}');
        } catch (e) {
            console.error('Failed to parse customer from localStorage', e);
            return {};
        }
    };

    const customer = getCustomerSafe();
    const guestName = customer.name || 'Anderson';
    const roomNumber = (customer.room?.roomNumber || customer.room || '402').toString();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [hotelName, setHotelName] = useState('Vishnu Suites');
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        
        // Fetch Hotel Info
        fetch(`${API_URL}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.hotelName) setHotelName(data.hotelName);
            })
            .catch(err => console.error('Error fetching settings:', err));

        // Fetch Activities
        fetch(`${API_URL}/api/guest-activity/${roomNumber}`)
            .then(res => res.json())
            .then(data => {
                setActivities(prev => {
                    // Filter out any fetched items already present (by ID) to avoid duplicates with socket updates
                    const existingIds = new Set(prev.map(a => a.id));
                    const newItems = data.filter(a => !existingIds.has(a.id));
                    return [...prev, ...newItems].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);
                });
            })
            .catch(err => console.error('Error fetching activities:', err));

        if (socket) {
            socket.emit('join_room', roomNumber);

            socket.on('status_updated', (data) => {
                setActivities(prev => prev.map(act =>
                    act.id === data.requestId ? { ...act, status: data.status } : act
                ));
            });

            socket.on('admin_activity', (data) => {
                if (data.room === roomNumber) {
                    setActivities(prev => {
                        // Prevent duplicates from multiple socket deliveries or race conditions
                        if (prev.find(a => a.id === data.id)) return prev;

                        const newActivity = {
                            id: data.id,
                            text: data.type === 'order' 
                                ? `Order #${data.id.toString().slice(-5).toUpperCase()}` 
                                : data.type === 'service'
                                    ? `${data.serviceType ? data.serviceType.charAt(0).toUpperCase() + data.serviceType.slice(1) : 'Service'} Request`
                                    : data.details || 'New Activity',
                            time: data.time || new Date(),
                            type: data.type,
                            status: data.status || 'Pending'
                        };

                        return [newActivity, ...prev].slice(0, 15);
                    });
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

    const handleHousekeeping = async () => {
        if (requesting) return;
        setRequesting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${API_URL}/api/service-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomNumber,
                    type: 'housekeeping',
                    details: 'Housekeeping requested from guest panel',
                    priority: 'normal'
                })
            });
            if (res.ok) {
                // Activity will be updated via socket
                console.log('Housekeeping requested successfully');
            }
        } catch (err) {
            console.error('Failed to request housekeeping:', err);
        } finally {
            setRequesting(false);
        }
    };

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

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="max-w-xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000 bg-[#f4f1ea] min-h-screen">
            {/* Hero Section */}
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
                        Welcome to <br />
                        <span className="italic text-[#ab9373]">{hotelName}</span>
                    </h1>
                    <p className="text-[#f4f1ea]/80 font-sans mt-5 text-[10px] flex items-center gap-2 uppercase tracking-[0.2em]">
                        Guest: {guestName} • Room {roomNumber}
                    </p>
                </div>
            </motion.div>

            {/* Need anything? Section */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="px-6 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-serif text-[#4a3b2c]">Need anything?</h2>
                    <p className="text-[#ab9373] text-[10px] uppercase tracking-[0.3em] mt-2">Instant Service Requests</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <button 
                        onClick={() => navigate('/guest/services')}
                        className="flex items-center justify-between p-6 bg-white border border-[#ab9373]/20 shadow-sm group hover:border-[#ab9373] transition-all"
                    >
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-[#fdfdfc] border border-[#e8e4d9] text-[#5a4634] group-hover:bg-[#5a4634] group-hover:text-white transition-colors">
                                <HandPlatter size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-lg font-serif text-[#4a3b2c]">Order Food</h4>
                                <p className="text-[10px] text-[#ab9373] uppercase tracking-widest mt-1">Gourmet room service</p>
                            </div>
                        </div>
                        <ArrowRightIcon size={20} className="text-[#ab9373] group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                        onClick={handleHousekeeping}
                        disabled={requesting}
                        className="flex items-center justify-between p-6 bg-white border border-[#ab9373]/20 shadow-sm group hover:border-[#ab9373] transition-all disabled:opacity-50"
                    >
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-[#fdfdfc] border border-[#e8e4d9] text-[#5a4634] group-hover:bg-[#5a4634] group-hover:text-white transition-colors">
                                <SprayCan size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-lg font-serif text-[#4a3b2c]">Request Housekeeping</h4>
                                <p className="text-[10px] text-[#ab9373] uppercase tracking-widest mt-1">Cleaning & fresh linens</p>
                            </div>
                        </div>
                        <ArrowRightIcon size={20} className="text-[#ab9373] group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                        onClick={() => navigate('/guest/chat')}
                        className="flex items-center justify-between p-6 bg-white border border-[#ab9373]/20 shadow-sm group hover:border-[#ab9373] transition-all"
                    >
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-[#fdfdfc] border border-[#e8e4d9] text-[#5a4634] group-hover:bg-[#5a4634] group-hover:text-white transition-colors">
                                <PhoneCall size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-lg font-serif text-[#4a3b2c]">Call Reception</h4>
                                <p className="text-[10px] text-[#ab9373] uppercase tracking-widest mt-1">24/7 Front desk support</p>
                            </div>
                        </div>
                        <ArrowRightIcon size={20} className="text-[#ab9373] group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>

            {/* Premium Status Row */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="px-6">
                <div className="grid grid-cols-3 divide-x divide-[#ab9373]/20 border border-[#ab9373]/20 bg-[#fdfdfc] shadow-sm">
                    <StatusItem label="YOUR ROOM" value={roomNumber} icon={<Key size={14} className="text-[#5a4634]" />} />
                    <StatusItem label="CHECKOUT" value={formatDate(customer.checkOut)} icon={<Calendar size={14} className="text-[#5a4634]" />} />
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
                    <h3 className="text-2xl font-serif text-[#4a3b2c] capitalize">Detailed Services</h3>
                    <div className="flex items-center gap-2 border border-[#ab9373] px-3 py-1.5 rounded-none">
                        <Clock size={10} className="text-[#5a4634]" />
                        <span className="text-[9px] font-sans font-medium text-[#5a4634] uppercase tracking-widest">v2.4.0</span>
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
                        Active Requests
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
    const navigate = useNavigate();
    return (
        <motion.button
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
            }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -2 }}
            onClick={() => to !== "#" && navigate(to)}
            className="flex flex-col items-center justify-center gap-4 p-5 bg-[#fdfdfc] border border-[#e8e4d9] shadow-sm rounded-none transition-all hover:shadow-md hover:border-[#ab9373] group"
        >
            <div className="p-3 bg-transparent border border-[#e8e4d9] text-[#5a4634] rounded-none group-hover:bg-[#5a4634] group-hover:text-white transition-colors duration-300">
                {icon}
            </div>
            <span className="text-[10px] font-sans text-[#8b7355] uppercase tracking-widest group-hover:text-[#5a4634] transition-colors">{label}</span>
        </motion.button>
    );
}

function ActivityItem({ activity, isLast }) {
    const status = activity?.status || 'Pending';
    const isCompleted = status.toLowerCase() === 'completed' || status.toLowerCase() === 'delivered';
    const isPending = status.toLowerCase() === 'pending' || status.toLowerCase() === 'new';

    const formatTimeSafe = (timeStr) => {
        try {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) return 'Recently';
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return 'Recently';
        }
    };

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
                    <p className="text-sm font-sans font-medium text-[#4a3b2c] truncate">{activity?.text || 'Service Request'}</p>
                    <span className="text-[10px] font-sans text-[#ab9373] whitespace-nowrap ml-2 mt-1">
                        {formatTimeSafe(activity?.time)}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[9px] font-sans uppercase tracking-widest px-2 py-0.5 border inline-flex items-center gap-1
                         ${isCompleted ? 'border-[#8b7355]/30 text-[#8b7355]' :
                            isPending ? 'border-[#ab9373]/30 text-[#ab9373]' : 'border-[#5a4634]/30 text-[#5a4634]'}`}
                    >
                        {status}
                    </span>
                    <span className="text-[10px] font-sans text-[#8b7355] capitalize italic">
                        • {activity?.type || 'service'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
