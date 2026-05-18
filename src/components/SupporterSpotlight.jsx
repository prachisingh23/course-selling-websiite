import React, { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { getDonationTier } from '@/utils/tierUtils';

const SupporterSpotlight = () => {
  const [supporters, setSupporters] = useState([]);

  useEffect(() => {
    const fetchTopDonors = async () => {
      const { data } = await supabase
        .from('public_donations')
        .select('donor_name, amount, created_at')
        .order('amount', { ascending: false })
        .limit(5);
        
      if (data) setSupporters(data);
    };
    
    fetchTopDonors();
  }, []);

  if (supporters.length === 0) return null;

  return (
    <section className="py-20 relative overflow-hidden bg-[#0F0F0F]">
      <div className="absolute top-0 left-0 w-full h-full bg-[#1A0F2E]/20 z-0"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] mb-4">
                <Crown className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Hall of Fame</span>
            </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-white">Top Supporters</h2>
          <p className="text-gray-400">Honoring those who have gone above and beyond.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {supporters.map((supporter, index) => {
            const tier = getDonationTier(supporter.amount);
            return (
              <div
                key={index}
                className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 flex items-center gap-4 min-w-[250px] hover:scale-105 transition-transform duration-200 ${index === 0 ? 'border-[#FFD700] bg-[#FFD700]/5' : ''}`}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${tier.border} ${tier.bg} ${tier.color}`}>
                      {tier.icon}
                  </div>
                  {index === 0 && (
                      <div className="absolute -top-3 -right-2 bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          #1
                      </div>
                  )}
                </div>
                
                <div>
                  <div className="font-bold text-white text-lg">{supporter.donor_name}</div>
                  <div className="flex items-center gap-2 text-sm">
                      <span className={`font-bold ${tier.color}`}>${supporter.amount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SupporterSpotlight;
