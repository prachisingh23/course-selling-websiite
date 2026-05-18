import React from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const PresetDonationButtons = ({ selectedAmount, onSelect }) => {
  const presets = [
    { amount: 25, icon: Star, label: 'Bronze', description: 'Start your support' },
    { amount: 100, icon: Zap, label: 'Silver', description: 'Make a strong impact' },
    { amount: 500, icon: Crown, label: 'Gold', description: 'Join the top tier' },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {presets.map((preset) => {
        const isSelected = selectedAmount === preset.amount.toString();
        const Icon = preset.icon;

        return (
          <button
            key={preset.amount}
            type="button"
            onClick={() => onSelect(preset.amount.toString())}
            className={cn(
              'relative rounded-[24px] border p-4 text-left transition-all',
              isSelected
                ? 'border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_18px_rgba(103,232,249,0.12)]'
                : 'border-white/10 bg-white/5 hover:border-cyan-300/20 hover:bg-white/8'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-cyan-100">
                <Icon className="h-5 w-5" />
              </div>
              {isSelected ? (
                <div className="rounded-full bg-cyan-300 p-1 text-[#04131c]">
                  <Check className="h-3 w-3" />
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              <span className="block text-2xl text-white">${preset.amount}</span>
              <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.24em] text-white/46">
                {preset.label}
              </span>
              <p className="mt-3 text-sm text-white/56">{preset.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default PresetDonationButtons;
