export const getDonationTier = (amount) => {
  const value = parseFloat(amount);
  if (value >= 1000) return { name: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/50', icon: '💎' };
  if (value >= 500) return { name: 'Gold', color: 'text-[#FFD700]', bg: 'bg-[#FFD700]/10', border: 'border-[#FFD700]/50', icon: '👑' };
  if (value >= 100) return { name: 'Silver', color: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/50', icon: '⚔️' };
  return { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/50', icon: '🛡️' };
};