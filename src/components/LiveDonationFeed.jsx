import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const LiveDonationFeed = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel('live-donations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations' }, (payload) => {
        const { donor_name, amount, is_anonymous } = payload.new;
        if (!is_anonymous) {
          const newItem = {
            id: Date.now(),
            text: `${donor_name} just donated $${amount}!`,
            amount
          };
          setMessages(prev => [newItem, ...prev].slice(0, 3));
          
          // Auto remove
          setTimeout(() => {
            setMessages(prev => prev.filter(item => item.id !== newItem.id));
          }, 10000);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-40 flex flex-col gap-2 pointer-events-none">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="bg-[#1A0F2E]/90 backdrop-blur-md border border-[#FFD700]/40 text-white px-6 py-3 rounded-l-full shadow-lg flex items-center gap-3 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-bold">
            $
          </div>
          <div>
             <p className="font-bold text-sm">{msg.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveDonationFeed;