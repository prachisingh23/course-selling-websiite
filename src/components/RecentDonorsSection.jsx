import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { getDonationTier } from '@/utils/tierUtils';

const RecentDonorsSection = () => {
  const [donors, setDonors] = useState([]);

  const fetchDonors = async () => {
    const { data } = await supabase
      .from('public_donations')
      .select('donor_name, amount, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setDonors(data);
  };

  useEffect(() => {
    fetchDonors();
    const interval = setInterval(fetchDonors, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full py-8 overflow-hidden bg-black/20 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-4 text-center">
          Latest Supporters
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {donors.map((donor, idx) => {
            const tier = getDonationTier(donor.amount);
            return (
              <div
                key={`${donor.created_at}-${idx}`}
                className={`flex items-center gap-3 px-4 py-2 rounded-full border ${tier.border} ${tier.bg} backdrop-blur-sm`}
              >
                <span className="text-lg">{tier.icon}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{donor.donor_name}</span>
                  <span className={`text-xs ${tier.color} font-bold`}>${donor.amount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentDonorsSection;
