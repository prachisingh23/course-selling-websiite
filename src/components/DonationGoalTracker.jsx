import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

const DonationGoalTracker = () => {
  const [progress, setProgress] = useState(0);
  const targetAmount = 5000;
  const currentAmount = 3450;
  const percentage = Math.min((currentAmount / targetAmount) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 400);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="media-panel p-8">
      <div className="relative">
        <Target className="absolute right-0 top-0 h-24 w-24 text-cyan-100/8" />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="media-kicker">Monthly Goal</p>
            <h3 className="mt-3 text-3xl text-white">Keep the platform moving this month</h3>
            <p className="media-copy mt-3">Help cover infrastructure, education, and ongoing product improvements.</p>
          </div>
          <div className="text-left md:text-right">
            <span className="text-4xl text-cyan-100">${currentAmount.toLocaleString()}</span>
            <span className="text-sm text-white/42"> / ${targetAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/6">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#8cecff,#ffd27a)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>

        <div className="mt-4 flex justify-between text-xs uppercase tracking-[0.22em] text-white/34">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default DonationGoalTracker;
