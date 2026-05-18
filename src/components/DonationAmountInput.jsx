import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Heart } from 'lucide-react';

const DonationAmountInput = ({ amount, setAmount }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [impactText, setImpactText] = useState('');
  const [colorClass, setColorClass] = useState('text-blue-400');

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    
    // Determine color based on amount
    if (numAmount < 25) setColorClass('text-blue-400');
    else if (numAmount < 100) setColorClass('text-purple-400');
    else setColorClass('text-pink-500');

    // Determine impact text
    if (numAmount >= 500) setImpactText('Provides a full scholarship for a student!');
    else if (numAmount >= 100) setImpactText('Funds a month of server costs!');
    else if (numAmount >= 50) setImpactText('Helps us create 5 new tutorials!');
    else if (numAmount >= 25) setImpactText('Supports one week of content creation.');
    else if (numAmount > 0) setImpactText('Every bit helps us grow!');
    else setImpactText('Enter an amount to see your impact');

  }, [amount]);

  return (
    <div className="w-full max-w-lg mx-auto mb-8 relative">
      <motion.div 
        animate={{ 
          scale: isFocused ? 1.02 : 1,
          borderColor: isFocused ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255, 255, 255, 0.1)' 
        }}
        className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 transition-colors duration-300"
      >
        <label className="block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">
          Enter Amount
        </label>
        
        <div className="relative flex items-center">
          <DollarSign className={`w-8 h-8 ${colorClass} absolute left-0 transition-colors duration-500`} />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full bg-transparent border-none text-5xl font-bold p-0 pl-10 focus:ring-0 placeholder-gray-700 outline-none transition-colors duration-500 ${colorClass}`}
            placeholder="0"
          />
        </div>

        <motion.div 
          className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mt-2 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: isFocused ? "100%" : "30%" }}
          transition={{ duration: 0.3 }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={impactText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mt-4 text-sm text-gray-300"
          >
            <Heart className="w-4 h-4 text-red-400 fill-current" />
            <span>{impactText}</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DonationAmountInput;