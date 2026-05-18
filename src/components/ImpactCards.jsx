import React from 'react';
import { motion } from 'framer-motion';
import { Users, Book, Globe, Heart } from 'lucide-react';

const ImpactCard = ({ icon: Icon, label, value, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:border-${color.split('-')[1]}-500/50 transition-colors group`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:opacity-20 transition-opacity`} />
      
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${color} bg-opacity-10 mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <h3 className="text-4xl font-bold mb-1 font-heading">{value}</h3>
        <p className="text-gray-400 font-medium">{label}</p>
      </div>
    </motion.div>
  );
};

const ImpactCards = () => {
  const impacts = [
    { icon: Book, label: "Tutorials Created", value: "500+", color: "from-blue-500 to-cyan-500" },
    { icon: Users, label: "Community Members", value: "10K+", color: "from-purple-500 to-pink-500" },
    { icon: Globe, label: "Countries Reached", value: "120+", color: "from-orange-500 to-red-500" },
    { icon: Heart, label: "Lives Impacted", value: "50K+", color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {impacts.map((impact, index) => (
        <ImpactCard 
          key={index} 
          {...impact} 
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};

export default ImpactCards;