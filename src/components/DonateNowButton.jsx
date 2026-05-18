import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glowVariants } from '@/utils/premiumAnimations';

const DonateNowButton = ({ onClick, className, children = "Donate Now" }) => {
  return (
    <motion.button
      onClick={onClick}
      variants={glowVariants}
      initial="visible"
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-white",
        "bg-gradient-to-r from-[#FFD700] via-orange-500 to-[#8B5CF6]",
        "border border-white/20 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Heart className="w-5 h-5 fill-current" />
      </motion.div>
      <span className="drop-shadow-md">{children}</span>
    </motion.button>
  );
};

export default DonateNowButton;