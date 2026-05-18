import React from 'react';
import { motion } from 'framer-motion';

const PremiumBlogPostLayout = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="media-shell relative min-h-screen overflow-hidden px-4 pb-16 pt-28 text-white lg:pt-32"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 h-96 w-full bg-gradient-to-b from-cyan-300/8 to-transparent" />
        <div className="absolute right-10 top-36 h-72 w-72 rounded-full bg-cyan-300/8 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-80 w-80 rounded-full bg-amber-200/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">{children}</div>
    </motion.div>
  );
};

export default PremiumBlogPostLayout;
