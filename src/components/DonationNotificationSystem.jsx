import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDonationNotifications } from '@/contexts/DonationNotificationContext';
import { X } from 'lucide-react';

const DonationNotificationSystem = () => {
  const { latestDonation } = useDonationNotifications();
  const [notification, setNotification] = useState(null);
  const [ConfettiComponent, setConfettiComponent] = useState(null);

  useEffect(() => {
    if (latestDonation) {
      setNotification(latestDonation);
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [latestDonation]);

  useEffect(() => {
    if (!notification || ConfettiComponent) {
      return undefined;
    }

    let active = true;

    import('react-confetti').then((module) => {
      if (active) {
        setConfettiComponent(() => module.default);
      }
    });

    return () => {
      active = false;
    };
  }, [notification, ConfettiComponent]);

  if (!notification) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
        {ConfettiComponent ? <ConfettiComponent recycle={false} numberOfPieces={200} gravity={0.3} /> : null}
        
        <motion.div
          initial={{ y: -100, opacity: 0, x: '50%' }}
          animate={{ y: 20, opacity: 1, x: '50%' }}
          exit={{ y: -100, opacity: 0, x: '50%' }}
          className="fixed top-4 right-1/2 translate-x-1/2 pointer-events-auto bg-[#1A0F2E] border border-[#FFD700] rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] p-4 flex items-center gap-4 min-w-[300px]"
        >
          <div className="p-2 bg-[#FFD700] rounded-full">
            <span className="text-xl">🎉</span>
          </div>
          <div>
            <h4 className="font-bold text-[#FFD700] text-sm">New Donation!</h4>
            <p className="text-white text-sm">
              <span className="font-bold">{notification.donor_name}</span> contributed <span className="text-[#FFD700] font-bold">${notification.amount}</span>
            </p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="ml-auto text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DonationNotificationSystem;
