import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const ReadingProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1.5 origin-left bg-gradient-to-r from-cyan-300 via-cyan-400 to-amber-300"
      style={{ scaleX }}
    />
  );
};

export default ReadingProgressBar;
