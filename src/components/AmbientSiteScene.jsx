import React from 'react';
import { motion } from 'framer-motion';

const orbConfig = [
  {
    className: 'left-[8%] top-[14%] h-36 w-36 bg-cyan-300/12',
    duration: 22,
    x: [0, 20, 0],
    y: [0, -24, 0],
  },
  {
    className: 'right-[10%] top-[20%] h-24 w-24 bg-amber-300/12',
    duration: 20,
    x: [0, -18, 0],
    y: [0, 18, 0],
  },
  {
    className: 'right-[16%] bottom-[18%] h-44 w-44 bg-cyan-400/8',
    duration: 26,
    x: [0, -16, 0],
    y: [0, 22, 0],
  },
];

const AmbientSiteScene = ({ subtle = false }) => {
  const visibleOrbs = subtle ? orbConfig.slice(0, 2) : orbConfig;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(125,211,252,0.08),transparent_20%),radial-gradient(circle_at_82%_14%,rgba(251,191,36,0.07),transparent_18%),radial-gradient(circle_at_50%_105%,rgba(34,197,94,0.05),transparent_22%)]" />

      {visibleOrbs.map((orb) => (
        <motion.div
          key={orb.className}
          animate={{ x: orb.x, y: orb.y }}
          transition={{ repeat: Infinity, duration: orb.duration, ease: 'easeInOut' }}
          className={`absolute rounded-full blur-3xl ${orb.className}`}
        />
      ))}

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: subtle ? 54 : 44, ease: 'linear' }}
        className="absolute left-[10%] top-[20%] h-[24rem] w-[24rem] rounded-full border border-cyan-200/6"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: subtle ? 48 : 38, ease: 'linear' }}
        className="absolute right-[8%] top-[24%] h-[18rem] w-[18rem] rounded-full border border-amber-200/6"
      />

      <motion.div
        animate={{ y: [0, -12, 0], rotate: [16, 20, 16] }}
        transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
        className="absolute right-[22%] top-[36%] h-24 w-24 rounded-[28px] border border-white/6 bg-white/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-sm [transform:rotate(16deg)]"
      />

      <div className="absolute inset-x-[4%] bottom-[-12vh] h-[44vh] [perspective:1800px]">
        <div className="absolute inset-x-[12%] bottom-[16%] h-[22%] rounded-[999px] bg-[radial-gradient(circle,rgba(125,211,252,0.14),rgba(8,24,35,0)_72%)] blur-3xl" />
        <motion.div
          animate={{ backgroundPosition: ['0px 0px', '0px 160px'] }}
          transition={{ repeat: Infinity, duration: subtle ? 28 : 22, ease: 'linear' }}
          className="absolute inset-x-0 bottom-0 h-full rounded-[50%] border border-white/5 opacity-[0.22] [transform:rotateX(76deg)]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: subtle ? '140px 140px' : '108px 108px',
          }}
        />
        <div className="absolute inset-x-[18%] bottom-[12%] h-[28%] rounded-[50%] border border-cyan-200/6 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),rgba(255,255,255,0.01)_56%,rgba(255,255,255,0)_72%)] opacity-58 [transform:rotateX(76deg)]" />
      </div>
    </div>
  );
};

export default AmbientSiteScene;
