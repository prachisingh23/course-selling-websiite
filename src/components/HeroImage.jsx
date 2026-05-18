import React from 'react';
import { motion } from 'framer-motion';

const HeroImage = () => {
  return (
    <div className='flex flex-col justify-center items-center'>
      <img
        src='https://imagedelivery.net/LqiWLm-3MGbYHtFuUbcBtA/119580eb-abd9-4191-b93a-f01938786700/public'
        alt='Hostinger Horizons'
        className="mb-10"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-3xl mx-auto text-center glass-card p-8 rounded-xl border border-white/10"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4 gradient-text">🎬 Imagine This…</h2>
        <p className="text-lg text-gray-300 mb-4">
          You have a story in your mind — emotional, powerful, visual.
          <br />Now imagine turning that story into a cinematic masterpiece using only AI.
          <br />No actors. No camera. No expensive software.
          <br />Just your imagination + AI.
        </p>
        <p className="text-xl font-semibold gradient-text">
          Welcome to the AI Cinematic Animation Mastery Course,
          <br />where creativity meets technology.
        </p>
      </motion.div>
    </div>
  );
};

export default HeroImage;