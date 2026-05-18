import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { getDonationTier } from '@/utils/tierUtils';
import { Button } from '@/components/ui/button';
import DonateNowButton from '@/components/DonateNowButton';
import MediaPageHeader from '@/components/media/MediaPageHeader';

const DonorsWallPage = ({ onNavigate }) => {
  const [donors, setDonors] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAllDonors = async () => {
      const { data } = await supabase
        .from('public_donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setDonors(data);
    };
    fetchAllDonors();
  }, []);

  const filteredDonors = useMemo(
    () =>
      donors.filter((donor) => {
        if (filter === 'all') return true;
        const tier = getDonationTier(donor.amount);
        return tier.name.toLowerCase() === filter;
      }),
    [donors, filter]
  );

  return (
    <>
      <Helmet>
        <title>Wall of Fame - Lifelapss Donors</title>
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-8">
          <MediaPageHeader
            eyebrow="Wall of Fame"
            title="Celebrating the supporters helping power the platform"
            description="This wall highlights the public donors who choose to support the mission and keep the platform moving forward."
            stats={[
              { label: 'Visible Donors', value: donors.length },
              { label: 'Filtered', value: filteredDonors.length },
              { label: 'Recognition', value: 'Public' },
              { label: 'Mission', value: 'Ongoing' },
            ]}
            actions={
              <>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onNavigate('home')}
                >
                  Back Home
                </Button>
                <DonateNowButton onClick={() => onNavigate('donate')}>Donate Now</DonateNowButton>
              </>
            }
          />

          <div className="flex flex-wrap justify-center gap-3">
            {['all', 'bronze', 'silver', 'gold', 'platinum'].map((tierName) => (
              <button
                key={tierName}
                type="button"
                onClick={() => setFilter(tierName)}
                className={`rounded-full border px-4 py-2 capitalize transition-all ${
                  filter === tierName
                    ? 'border-cyan-300/30 bg-cyan-300 text-[#041b26]'
                    : 'border-white/10 bg-white/5 text-white/62 hover:border-cyan-300/20 hover:text-white'
                }`}
              >
                {tierName}
              </button>
            ))}
          </div>

          <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDonors.map((donor, index) => {
              const tier = getDonationTier(donor.amount);
              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04 }}
                  key={donor.id}
                  className="media-panel-soft relative overflow-hidden p-6"
                >
                  <div className="absolute right-0 top-0 rounded-bl-2xl bg-white/8 px-3 py-2 text-2xl">
                    {tier.icon}
                  </div>
                  <h3 className="text-xl text-white">{donor.donor_name}</h3>
                  <p className="mt-1 text-lg font-semibold text-cyan-100">${donor.amount}</p>
                  <p className="mt-4 text-xs text-white/36">
                    {new Date(donor.created_at).toLocaleDateString()}
                  </p>
                  {donor.message ? (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-sm italic text-white/58">"{donor.message}"</p>
                    </div>
                  ) : null}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DonorsWallPage;
