import React from 'react';
import { Users, Globe, BookOpen, Heart } from 'lucide-react';

const stats = [
  { icon: Users, value: "12k+", label: "Students Reached", color: "text-blue-400" },
  { icon: Globe, value: "45+", label: "Countries", color: "text-green-400" },
  { icon: BookOpen, value: "150+", label: "Free Tutorials", color: "text-purple-400" },
  { icon: Heart, value: "$8.5k", label: "Donated", color: "text-pink-400" },
];

const ImpactStatsWidget = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-[#1A0F2E]/50 border border-white/5 rounded-xl p-4 flex flex-col items-center text-center backdrop-blur-sm hover:border-white/10 transition-colors"
        >
          <div className={`mb-2 p-2 rounded-full bg-white/5 ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">{stat.value}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default ImpactStatsWidget;