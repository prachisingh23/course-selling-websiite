import React, { useEffect, useState } from 'react';
import { X, Heart, Coffee, Pizza, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DonationModal = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check constraints immediately
    const hasSeenModal = localStorage.getItem('hasSeenDonationModal');
    const lastSeenTime = localStorage.getItem('donationModalTimestamp');
    const now = new Date().getTime();
    
    // Show if never seen OR if 24 hours (86400000 ms) have passed
    const shouldShow = !hasSeenModal || (lastSeenTime && now - parseInt(lastSeenTime) > 86400000);

    if (shouldShow) {
      // Set the timer for 5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
        // We set local storage NOW so if they refresh, it won't pop up immediately again if within 24h
        localStorage.setItem('hasSeenDonationModal', 'true');
        localStorage.setItem('donationModalTimestamp', now.toString());
      }, 5000); 
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => setIsOpen(false);

  const handleRemindLater = () => {
    // Reset timer to show again in 1 hour instead of 24h
    const now = new Date().getTime();
    localStorage.setItem('donationModalTimestamp', (now - 86400000 + 3600000).toString());
    setIsOpen(false);
  };

  const handleDonate = () => {
    setIsOpen(false);
    onNavigate('donate');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
        {/* Backdrop */}
        <div
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        {/* Modal Content */}
        <div className="relative w-full md:w-[480px] bg-[#1A0F2E] md:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Gradient Top Line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FFD700] via-purple-500 to-pink-500" />

            <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full z-10"
                aria-label="Close modal"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8 text-center flex-1 overflow-y-auto">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(236,72,153,0.3)] ring-4 ring-white/5">
                    <Heart className="w-8 h-8 text-white fill-current" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-heading leading-tight">
                    Support Our Mission
                </h2>
                <p className="text-gray-300 mb-8 text-base leading-relaxed px-2">
                    We're dedicated to keeping high-quality AI education <span className="text-[#FFD700] font-bold">free for everyone</span>. A small contribution helps us maintain servers and create new tools.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                      <button 
                        onClick={handleDonate} 
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-[#FFD700]/10 border border-white/10 hover:border-[#FFD700]/50 transition-all group touch-manipulation min-h-[100px]"
                    >
                          <Coffee className="w-8 h-8 mb-2 text-gray-400 group-hover:text-[#FFD700] transition-colors" />
                          <span className="text-sm font-bold text-white group-hover:text-[#FFD700]">$5 Coffee</span>
                      </button>
                      <button 
                        onClick={handleDonate} 
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-[#FFD700]/10 border border-white/10 hover:border-[#FFD700]/50 transition-all group touch-manipulation min-h-[100px]"
                    >
                          <Pizza className="w-8 h-8 mb-2 text-gray-400 group-hover:text-[#FFD700] transition-colors" />
                          <span className="text-sm font-bold text-white group-hover:text-[#FFD700]">$25 Lunch</span>
                      </button>
                </div>

                <Button 
                    onClick={handleDonate}
                    className="w-full bg-gradient-to-r from-[#FFD700] to-orange-500 text-[#1A0F2E] hover:opacity-90 font-bold h-14 rounded-xl text-lg mb-4 shadow-lg transition-transform flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-5 h-5" /> Donate Now
                </Button>
                
                <button 
                    onClick={handleRemindLater}
                    className="w-full py-3 text-gray-500 text-sm font-medium hover:text-white transition-colors"
                >
                    Remind me later
                </button>
            </div>
        </div>
    </div>
  );
};

export default DonationModal;