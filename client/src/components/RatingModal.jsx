import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RatingModal({ isOpen, onClose, onSubmit, guestName, roomNumber }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setSubmitting(true);
        try {
            await onSubmit({ rating, comment, guestName, roomNumber });
            onClose();
            // Reset form
            setRating(0);
            setComment('');
        } catch (error) {
            console.error('Failed to submit review:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-[#f4f1ea] w-full max-w-md overflow-hidden relative border border-[#ab9373]/30"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-[#8b7355] hover:text-[#4a3b2c] transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-serif text-[#4a3b2c]">Rate Your Stay</h3>
                            <p className="text-[10px] text-[#ab9373] uppercase tracking-[0.2em] mt-2">We value your feedback</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                size={32}
                                                className={`transition-colors ${(hover || rating) >= star
                                                        ? 'fill-[#ab9373] text-[#ab9373]'
                                                        : 'text-[#ab9373]/30'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-xs font-sans text-[#8b7355] uppercase tracking-widest">
                                    {rating ? `${rating} Stars` : 'Select a rating'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-sans text-[#ab9373] uppercase tracking-widest ml-1">
                                    Your Comments
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us about your experience..."
                                    className="w-full h-32 p-4 bg-white border border-[#ab9373]/20 focus:border-[#ab9373] focus:ring-1 focus:ring-[#ab9373] outline-none transition-all resize-none font-sans text-sm text-[#4a3b2c]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={rating === 0 || submitting}
                                className="w-full py-4 bg-[#5a4634] text-white font-serif text-lg hover:bg-[#4a3b2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                            >
                                {submitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
