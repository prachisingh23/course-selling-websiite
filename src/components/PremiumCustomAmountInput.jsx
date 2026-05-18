import React, { useState, useEffect } from 'react';
import { AlertCircle, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const PremiumCustomAmountInput = ({ amount, setAmount }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (amount && parseFloat(amount) < 25) {
      setError('Minimum donation is $25');
    } else {
      setError('');
    }
  }, [amount]);

  return (
    <div className="group relative mb-8 w-full">
      <div
        className={cn(
          'relative overflow-hidden rounded-[24px] border p-4 transition-all',
          error
            ? 'border-red-400/40 bg-red-400/5'
            : isFocused
              ? 'border-cyan-300/30 bg-cyan-300/6'
              : 'border-white/10 bg-white/5'
        )}
      >
        <label
          className={cn(
            'pointer-events-none absolute left-4 transition-all duration-300',
            isFocused || amount
              ? 'top-2 text-xs text-cyan-100'
              : 'top-1/2 -translate-y-1/2 text-base text-white/40'
          )}
        >
          Enter Custom Amount (Min $25)
        </label>

        <div className="mt-2 flex items-center">
          <DollarSign className={cn('mr-2 h-5 w-5', error ? 'text-red-400' : isFocused ? 'text-cyan-100' : 'text-white/40')} />
          <input
            type="number"
            min="25"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent border-none p-0 text-2xl text-white outline-none"
          />
        </div>
      </div>

      {error ? (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : (
        <p className="mt-2 pl-1 text-xs text-white/40">Every contribution above $25 unlocks exclusive perks.</p>
      )}
    </div>
  );
};

export default PremiumCustomAmountInput;
