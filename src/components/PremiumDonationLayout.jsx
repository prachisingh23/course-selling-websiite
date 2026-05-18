import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const PremiumDonationLayout = ({ children }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 160]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="media-shell min-h-screen text-white">
      <section className="relative flex min-h-[620px] items-center justify-center overflow-hidden px-4 pt-28 lg:pt-32">
        <div className="absolute inset-0 premium-gradient-bg opacity-95" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />

        <motion.div style={{ y: y1, opacity }} className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="inline-block rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1 text-sm font-bold uppercase tracking-[0.28em] text-cyan-100">
            Support Our Mission
          </div>

          <h1 className="mt-6 text-5xl leading-none text-white md:text-7xl">
            Help fund open learning and a better creator platform.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/66">
            Donations help keep education accessible, the platform improving, and community resources available to more creators.
          </p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-10 rounded-full border border-white/10 bg-white/5 p-3 text-white/58 transition-all hover:bg-white/10 hover:text-white"
          >
            <ArrowDown className="h-6 w-6" />
          </motion.button>
        </motion.div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#04090d] to-transparent" />
      </section>

      <div id="main-content" className="relative z-20 mx-auto -mt-12 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
};

export default PremiumDonationLayout;
