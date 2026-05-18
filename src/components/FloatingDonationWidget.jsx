import React from 'react';
import { Heart } from 'lucide-react';
import { useDonationNotifications } from '@/contexts/DonationNotificationContext';

const FloatingDonationWidget = ({ onNavigate }) => {
  const { totalDonationsToday } = useDonationNotifications();

  return (
    <button
      onClick={() => onNavigate('donate')}
      className="fixed bottom-24 right-4 z-40 group flex items-center justify-center transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-300 to-amber-300 blur opacity-70 transition-opacity group-hover:opacity-100"></div>
      
      {totalDonationsToday > 0 && (
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0F0F0F] z-50">
          {totalDonationsToday}
        </div>
      )}

      <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-[#08131c]/94 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div>
          <Heart className="h-6 w-6 fill-current text-amber-300" />
        </div>
        <span className="hidden pr-1 font-bold text-white md:block">Support</span>
      </div>
    </button>
  );
};

export default FloatingDonationWidget;
