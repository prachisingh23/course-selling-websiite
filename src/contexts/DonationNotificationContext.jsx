import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/loadSupabaseClient';

const DonationNotificationContext = createContext();

export const DonationNotificationProvider = ({ children }) => {
  const [latestDonation, setLatestDonation] = useState(null);
  const [totalDonationsToday, setTotalDonationsToday] = useState(0);

  useEffect(() => {
    const fetchDonationSnapshot = async () => {
      const supabase = await getSupabase();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [{ data: latestData }, { count }] = await Promise.all([
        supabase
          .from('public_donations')
          .select('id, donor_name, amount, message, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('public_donations')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
      ]);

      setLatestDonation(latestData || null);
      setTotalDonationsToday(count || 0);
    };

    fetchDonationSnapshot();
    const intervalId = window.setInterval(fetchDonationSnapshot, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <DonationNotificationContext.Provider value={{ latestDonation, totalDonationsToday }}>
      {children}
    </DonationNotificationContext.Provider>
  );
};

export const useDonationNotifications = () => useContext(DonationNotificationContext);
