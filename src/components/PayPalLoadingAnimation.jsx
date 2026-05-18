import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const PayPalLoadingAnimation = ({ status = 'loading' }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-4 p-8">
      {status === 'loading' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-300/20 blur-md" />
            <Loader2 className="relative z-10 h-10 w-10 animate-spin text-cyan-100" />
          </div>
          <p className="mt-4 text-sm font-medium text-white/62">
            Connecting to secure payment gateway...
          </p>
        </motion.div>
      ) : null}

      {status === 'loading' ? (
        <div className="mt-4 w-full max-w-xs space-y-3">
          <div className="h-12 w-full animate-pulse rounded-full bg-white/5" />
          <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-white/5" />
        </div>
      ) : null}
    </div>
  );
};

export default PayPalLoadingAnimation;
