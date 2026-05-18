import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DonationSectionCard = ({ onNavigate }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative overflow-hidden rounded-xl border border-[#FFD700]/30 bg-gradient-to-br from-[#1A0F2E] to-black p-6 shadow-xl group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-24 h-24 text-[#FFD700]" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-[#FFD700]/10 rounded-full">
                 <Heart className="w-5 h-5 text-[#FFD700] fill-current" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">Support Creators</span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 font-heading">Love this course?</h3>
        <p className="text-sm text-gray-400 mb-6 flex-grow">
          Your donations help us create more free high-quality content and keep our servers running for students worldwide.
        </p>
        
        <Button 
          onClick={() => onNavigate('donate')}
          className="w-full bg-white/10 hover:bg-[#FFD700] hover:text-[#1A0F2E] text-white border border-white/10 transition-all font-semibold"
        >
          Make a Donation
        </Button>
      </div>
    </motion.div>
  );
};

export default DonationSectionCard;