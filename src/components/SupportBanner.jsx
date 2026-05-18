import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SupportBanner = ({ onNavigate, variant = "default" }) => {
  const content = {
    default: {
      title: "Enjoying our content?",
      text: "Support independent creators and help us keep the lights on.",
      buttonText: "Buy us a coffee"
    },
    course: {
      title: "Learning for free?",
      text: "Pay it forward! Your donation helps us provide free education to those who can't afford it.",
      buttonText: "Support Education"
    },
    blog: {
      title: "Found this article helpful?",
      text: "Your support enables us to research and write more in-depth guides.",
      buttonText: "Support the Author"
    }
  };

  const selectedContent = content[variant] || content.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-12 relative rounded-2xl overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D1B4E] via-[#4c1d95] to-[#db2777] opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-4">
                 <div className="hidden md:flex bg-white/10 p-4 rounded-full backdrop-blur-sm">
                    <Coffee className="w-8 h-8 text-[#FFD700]" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-white font-heading mb-2">{selectedContent.title}</h3>
                    <p className="text-purple-100 max-w-xl">{selectedContent.text}</p>
                 </div>
            </div>
            
            <Button 
                onClick={() => onNavigate('donate')}
                className="whitespace-nowrap bg-white text-purple-900 hover:bg-[#FFD700] hover:text-[#1A0F2E] font-bold px-8 py-6 rounded-full shadow-lg transition-all"
            >
                {selectedContent.buttonText} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
        </div>
    </motion.div>
  );
};

export default SupportBanner;