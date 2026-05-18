import React, { useState, useEffect, useRef } from 'react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { useToast } from './ui/use-toast';
import paypalService from '@/services/paypalService';
import { Heart, Lock, Users } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/customSupabaseClient';
import PayPalLoadingAnimation from './PayPalLoadingAnimation';
import PresetDonationButtons from './PresetDonationButtons';
import PremiumCustomAmountInput from './PremiumCustomAmountInput';

const DonationForm = () => {
  const [amount, setAmount] = useState('25');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isValidAmount, setIsValidAmount] = useState(true);

  const { toast } = useToast();
  const { user } = useAuth();
  const paypalContainerRef = useRef(null);
  const buttonsRendered = useRef(false);

  useEffect(() => {
    const numAmount = parseFloat(amount);
    setIsValidAmount(!Number.isNaN(numAmount) && numAmount >= 25);
  }, [amount]);

  useEffect(() => {
    if (paypalContainerRef.current) {
      paypalContainerRef.current.innerHTML = '';
      buttonsRendered.current = false;
    }

    if (isValidAmount && paypalContainerRef.current && !buttonsRendered.current) {
      buttonsRendered.current = true;
      setLoading(true);

      const numAmount = parseFloat(amount);

      if (paypalService && typeof paypalService.renderPayPalButtons === 'function') {
        paypalService
          .renderPayPalButtons(
            'paypal-button-container',
            numAmount,
            'USD',
            handlePaymentSuccess,
            handlePaymentError
          )
          .then(() => {
            setTimeout(() => setLoading(false), 500);
          })
          .catch((error) => {
            console.error('Failed to render PayPal buttons:', error);
            setLoading(false);
            buttonsRendered.current = false;
          });
      } else {
        console.error('PayPal Service is not properly initialized');
        setLoading(false);
      }
    }
  }, [isValidAmount, amount]);

  const handlePaymentSuccess = async (details) => {
    try {
      setLoading(true);
      const numAmount = parseFloat(amount);

      const donationData = {
        donor_id: user ? user.id : null,
        donor_name: isAnonymous ? 'Anonymous' : user?.user_metadata?.full_name || details.payer_name || 'Supporter',
        donor_email: user?.email || details.payer_email,
        amount: numAmount,
        payment_method: 'paypal',
        payment_id: details.paypal_payment_id || details.paypal_order_id,
        message,
        is_anonymous: isAnonymous,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('donations').insert([donationData]);

      if (error) throw error;

      setPaymentSuccess(true);

      toast({
        title: 'Thank you for your donation',
        description: `Your contribution of $${numAmount} has been received.`,
      });

      setTimeout(() => {
        setPaymentSuccess(false);
        setMessage('');
        buttonsRendered.current = false;
        if (paypalContainerRef.current) paypalContainerRef.current.innerHTML = '';
      }, 8000);
    } catch (error) {
      console.error('Error saving donation:', error);
      toast({
        title: 'Donation Recorded with Issues',
        description: "Payment was successful, but we couldn't save the record. Please contact support.",
        variant: 'warning',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    setLoading(false);
    toast({
      title: 'Payment Failed',
      description: 'There was an error processing your donation. Please try again.',
      variant: 'destructive',
    });
    console.error('PayPal Error:', error);
    buttonsRendered.current = false;
  };

  if (paymentSuccess) {
    return (
      <div className="media-panel p-8 text-center transition-all duration-300">
        <div className="mb-4 inline-flex rounded-full bg-cyan-300/12 p-4">
          <Heart className="h-12 w-12 fill-current text-cyan-100" />
        </div>
        <h3 className="text-2xl text-white">Thank You</h3>
        <p className="mt-2 text-white/62">Your donation has been successfully processed.</p>
      </div>
    );
  }

  const studentImpact = Math.floor(parseFloat(amount || 0) / 25);

  return (
    <div className="glass-card w-full rounded-[28px] p-6 md:p-8">
      <div className="mb-6 text-center">
        <h3 className="text-2xl text-white">Choose Amount</h3>
        <p className="mt-2 text-sm text-white/44">Join the community of supporters</p>
      </div>

      <PresetDonationButtons selectedAmount={amount} onSelect={setAmount} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#071019] px-2 text-white/34">Or enter custom amount</span>
        </div>
      </div>

      <PremiumCustomAmountInput amount={amount} setAmount={setAmount} />

      {studentImpact >= 1 && isValidAmount ? (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm font-medium text-cyan-100">
          <Users className="h-4 w-4" />
          <span>Your donation helps approximately {studentImpact} student{studentImpact > 1 ? 's' : ''}.</span>
        </div>
      ) : null}

      <div className="mt-4 space-y-6 border-t border-white/10 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-white">Payment Details</h4>
          <div className="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
            <Lock className="h-3 w-3" />
            Secure SSL Encrypted
          </div>
        </div>

        <div>
          <Label htmlFor="message" className="mb-2 block text-sm text-white/72">Leave a Message (Optional)</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share why you're supporting us..."
            className="resize-none border-white/10 bg-white/5 text-white placeholder:text-white/28"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] p-4">
          <div className="flex flex-col">
            <Label htmlFor="anonymous" className="cursor-pointer font-medium text-white">Anonymous Donation</Label>
            <span className="text-xs text-white/38">Hide your name from public donor lists</span>
          </div>
          <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
        </div>

        <div className="relative min-h-[150px] pt-4">
          {loading ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-[#071019]/90 backdrop-blur-sm">
              <PayPalLoadingAnimation />
            </div>
          ) : null}

          {isValidAmount ? (
            <div id="paypal-button-container" ref={paypalContainerRef} className="relative z-10 w-full" />
          ) : (
            <div className="rounded-lg border border-dashed border-red-400/30 bg-red-400/5 py-8 text-center">
              <Heart className="mx-auto mb-2 h-8 w-8 text-red-300/60" />
              <p className="text-red-300">Please enter a valid amount ($25 minimum)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationForm;
