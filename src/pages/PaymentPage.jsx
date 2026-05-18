import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  Globe,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/useAuth';
import { toast } from '@/components/ui/use-toast';
import razorpayService from '../services/razorpayService';
import paypalService from '../services/paypalService';
import { supabase } from '@/lib/customSupabaseClient';
import {
  clearStoredSelectedCourseId,
  getCourseById,
  getStoredSelectedCourseId,
} from '@/services/courseService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getCurrencySymbol = (country = '') =>
  country.toLowerCase().includes('india') ? '₹' : '$';

const allCountries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'China',
  'Brazil',
  'Other',
];

const PaymentPage = ({ onNavigate, courseData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isCourseLoading, setIsCourseLoading] = useState(() => !courseData && !window.selectedCourse);
  const [paypalState, setPaypalState] = useState('idle');
  const [country, setCountry] = useState('United States');
  const [priceDetails, setPriceDetails] = useState({
    symbol: '$',
    offerPrice: 0,
    originalPrice: 0,
    discount: 0,
    currency: 'USD',
  });
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [resolvedCourse, setResolvedCourse] = useState(() => courseData || window.selectedCourse || null);
  const [paypalRenderNonce, setPaypalRenderNonce] = useState(0);
  const paypalContainerRef = useRef(null);
  const { user } = useAuth();

  const course = resolvedCourse;

  useEffect(() => {
    let mounted = true;
    let redirectTimer;

    const resolveCourse = async () => {
      const directCourse = courseData || window.selectedCourse;

      if (directCourse) {
        if (mounted) {
          setResolvedCourse(directCourse);
          setIsCourseLoading(false);
        }
        return;
      }

      const storedCourseId = getStoredSelectedCourseId();

      if (!storedCourseId) {
        toast({
          title: 'No Course Selected',
          description: 'Redirecting you back to courses...',
          variant: 'destructive',
        });
        redirectTimer = setTimeout(() => onNavigate('courses'), 2000);
        if (mounted) {
          setIsCourseLoading(false);
        }
        return;
      }

      try {
        const storedCourse = await getCourseById(storedCourseId);

        if (!mounted) {
          return;
        }

        window.selectedCourse = storedCourse;
        setResolvedCourse(storedCourse);
      } catch (error) {
        console.error('Failed to restore selected course:', error);
        clearStoredSelectedCourseId();
        toast({
          title: 'Course Not Found',
          description: 'Redirecting you back to courses...',
          variant: 'destructive',
        });
        redirectTimer = setTimeout(() => onNavigate('courses'), 2000);
      } finally {
        if (mounted) {
          setIsCourseLoading(false);
        }
      }
    };

    resolveCourse();

    return () => {
      mounted = false;
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [courseData, onNavigate]);

  const updatePrice = (newCountry, promo) => {
    const isIndia = newCountry === 'India';
    let basePrice = isIndia
      ? course?.pricing?.inr?.current ?? 3080
      : course?.pricing?.usd?.current ?? 34.99;
    const originalPrice = isIndia
      ? course?.pricing?.inr?.original ?? 8800
      : course?.pricing?.usd?.original ?? 99.99;
    let discount = 65;

    if (promo && promo.is_active) {
      const promoDiscount = basePrice * (promo.discount_percentage / 100);
      basePrice -= promoDiscount;
      discount = Math.round(((originalPrice - basePrice) / originalPrice) * 100);
    }

    setPriceDetails({
      symbol: getCurrencySymbol(newCountry),
      offerPrice: parseFloat(basePrice.toFixed(2)),
      originalPrice: parseFloat(originalPrice.toFixed(2)),
      discount,
      currency: isIndia ? 'INR' : 'USD',
    });
  };

  useEffect(() => {
    if (course) {
      updatePrice(country, appliedPromo);
    }
  }, [country, appliedPromo, course]);

  useEffect(() => {
    if (country === 'India' || !course) {
      return;
    }

    paypalService.initializeSDK().catch((error) => {
      console.error('Failed to preload PayPal SDK:', error);
    });
  }, [country, course]);

  useEffect(() => {
    if (country === 'India' || !course || !priceDetails.offerPrice) {
      setPaypalState('idle');
      return;
    }

    if (paypalContainerRef.current) {
      paypalContainerRef.current.innerHTML = '';
    }

    let cancelled = false;

    const loadPayPal = async () => {
      setPaypalState('loading');

      try {
        if (paypalService && typeof paypalService.renderPayPalButtons === 'function') {
          await paypalService.renderPayPalButtons(
            'paypal-button-container',
            priceDetails.offerPrice,
            'USD',
            handlePaymentSuccess,
            (error) => {
              console.error('PayPal Error:', error);

              if (!cancelled) {
                setPaypalState('error');
              }

              toast({
                title: 'PayPal Error',
                description: 'Transaction failed or cancelled.',
                variant: 'destructive',
              });
            }
          );

          if (!cancelled) {
            setPaypalState('ready');
          }
        }
      } catch (error) {
        console.error('Failed to render PayPal buttons:', error);
        if (!cancelled) {
          setPaypalState('error');
        }
      }
    };

    loadPayPal();

    return () => {
      cancelled = true;
    };
  }, [country, course, paypalRenderNonce, priceDetails.offerPrice, toast]);

  const handleApplyPromoCode = async () => {
    if (!promoCode) {
      toast({ title: 'Promo Code', description: 'Please enter a promo code.', variant: 'destructive' });
      return;
    }

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in before applying a promo code.',
        variant: 'destructive',
      });
      onNavigate('login');
      return;
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .single();

    if (error || !data) {
      toast({ title: 'Invalid Code', description: 'This promo code is not valid.', variant: 'destructive' });
      setAppliedPromo(null);
      return;
    }

    if (!data.is_active) {
      toast({ title: 'Inactive Code', description: 'This promo code is no longer active.', variant: 'destructive' });
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(data);
    toast({
      title: 'Success',
      description: `Promo code "${data.code}" applied for ${data.discount_percentage}% off.`,
    });
  };

  const handlePaymentSuccess = async () => {
    try {
      setIsProcessing(true);
      if (!user) {
        toast({
          title: 'Login Required',
          description: 'Please log in to complete enrollment.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      const enrollmentData = {
        user_id: user.id,
        course_id: course.id,
        promo_code_id: appliedPromo ? appliedPromo.id : null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('enrollments').insert(enrollmentData);

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already Enrolled', description: 'You already own this course. Redirecting...' });
          clearStoredSelectedCourseId();
          window.selectedCourse = null;
          setTimeout(() => onNavigate('enrolled-courses'), 2000);
          return;
        }
        throw error;
      }

      setIsComplete(true);
      clearStoredSelectedCourseId();
      window.selectedCourse = null;
      toast({ title: 'Payment Successful', description: 'You have successfully enrolled in this course.' });
      setTimeout(() => onNavigate('enrolled-courses'), 2500);
    } catch (error) {
      console.error('Error saving enrollment:', error);
      toast({
        title: 'Enrollment Issue',
        description: 'Payment successful but enrollment failed. Support has been notified.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async (event) => {
    event.preventDefault();
    if (country !== 'India') return;

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in before purchasing.',
        variant: 'destructive',
      });
      onNavigate('login');
      return;
    }

    setIsProcessing(true);
    try {
      const orderId = await razorpayService.createRazorpayOrder(priceDetails.offerPrice, 'INR');

      const options = razorpayService.createPaymentOptions(
        priceDetails.offerPrice,
        'INR',
        'LifeLapss',
        `Payment for ${course.title}`,
        orderId
      );

      options.prefill = {
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        contact: user.phone || '',
      };

      const response = await razorpayService.initializePayment(options);

      if (response?.razorpay_payment_id) {
        await handlePaymentSuccess({ ...response, payment_method: 'razorpay' });
      }
    } catch (error) {
      console.error('Payment failed:', error);
      if (error.code !== 'PAYMENT_CANCELLED') {
        toast({
          title: 'Payment Failed',
          description: error.message || 'There was an issue processing your payment.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCourseLoading || !course) {
    return (
      <div className="media-shell flex min-h-screen items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-cyan-200" />
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="media-shell flex min-h-screen items-center justify-center px-4 text-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card max-w-md rounded-[32px] p-8 text-center">
          <CheckCircle className="mx-auto mb-6 h-20 w-20 text-cyan-100" />
          <h1 className="text-3xl text-white">You&apos;re in</h1>
          <p className="mt-4 text-white/62">
            You&apos;ve successfully enrolled in <span className="font-semibold text-cyan-100">{course.title}</span>.
          </p>
          <Button
            onClick={() => onNavigate('enrolled-courses')}
            className="mt-8 w-full rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
          >
            Start Learning
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Secure Checkout - Lifelapss</title>
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-6xl space-y-6">
          <Button
            onClick={() => onNavigate('courses')}
            variant="ghost"
            className="rounded-full border border-white/10 bg-white/5 pl-4 pr-5 text-white/72 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="media-panel p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="media-kicker">Order Summary</p>
                  <h1 className="mt-3 text-3xl text-white">Secure checkout</h1>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
                  <ShieldCheck className="h-4 w-4" />
                  SSL Encrypted
                </div>
              </div>

              <div className="media-panel-soft overflow-hidden p-6">
                <h3 className="text-xl text-white">{course.title}</h3>
                <p className="mt-1 text-sm text-white/44">Lifetime access · Certificate included</p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/58">Original price</span>
                    <span className="text-white/38 line-through">
                      {priceDetails.symbol}
                      {priceDetails.originalPrice}
                    </span>
                  </div>

                  {appliedPromo ? (
                    <div className="flex items-center justify-between text-cyan-100">
                      <span className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Promo ({appliedPromo.code})
                      </span>
                      <span>-{appliedPromo.discount_percentage}%</span>
                    </div>
                  ) : null}

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-white">Total</span>
                      <span className="text-4xl text-cyan-100">
                        {priceDetails.symbol}
                        {priceDetails.offerPrice}
                      </span>
                    </div>
                    <div className="mt-4 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                      You save {priceDetails.discount}% today
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <Label id="billing-country-label" htmlFor="country" className="mb-2 block text-sm text-white/72">
                    <Globe className="mr-2 inline h-4 w-4" />
                    Billing Country
                  </Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger
                      id="country"
                      aria-labelledby="billing-country-label"
                      className="checkout-country-select h-12 w-full rounded-[18px] px-4 text-white data-[placeholder]:text-white/56 [&_svg]:text-cyan-100/82"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="checkout-country-select-content">
                      {allCountries.map((countryName) => (
                        <SelectItem key={countryName} value={countryName} className="checkout-country-select-item">
                          {countryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="promo-code" className="mb-2 block text-sm text-white/72">
                    Have a Promo Code?
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo-code"
                      placeholder="Ex: SAVE20"
                      value={promoCode}
                      onChange={(event) => setPromoCode(event.target.value)}
                      disabled={!!appliedPromo}
                      className="form-surface h-12 rounded-[18px]"
                    />
                    <Button
                      onClick={handleApplyPromoCode}
                      disabled={!!appliedPromo || !promoCode}
                      variant={appliedPromo ? 'secondary' : 'default'}
                      className={
                        appliedPromo
                          ? 'rounded-full bg-emerald-500 text-[#04130d] hover:bg-emerald-400'
                          : 'rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200'
                      }
                    >
                      {appliedPromo ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="media-panel p-6 md:p-8">
              <div className="mb-6">
                <p className="media-kicker">Payment Method</p>
                <h2 className="mt-3 text-3xl text-white">Choose how you want to pay</h2>
              </div>

              {country === 'India' ? (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="media-panel-soft relative overflow-hidden p-8 text-center">
                  <div className="absolute right-0 top-0 rounded-bl-2xl bg-cyan-300 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#041b26]">
                    Recommended
                  </div>
                  <Smartphone className="mx-auto mb-6 h-16 w-16 text-cyan-100" />
                  <h3 className="text-2xl text-white">Pay with UPI, Card, or Netbanking</h3>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-white/56">
                    Fast and secure payments via Razorpay with support for UPI apps and major cards.
                  </p>
                  <Button
                    onClick={handleRazorpayPayment}
                    disabled={isProcessing}
                    className="mt-8 w-full rounded-full bg-cyan-300 py-6 text-lg text-[#041b26] hover:bg-cyan-200"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing Securely...
                      </>
                    ) : (
                      `Pay ${priceDetails.symbol}${priceDetails.offerPrice} Securely`
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="media-panel-soft p-8">
                  <h3 className="text-2xl text-white">Pay with PayPal or card</h3>
                  <p className="mt-3 text-sm leading-7 text-white/56">
                    Trusted worldwide for secure international transactions.
                  </p>

                  <div className="mt-6 min-h-[280px] rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <div id="paypal-button-container" ref={paypalContainerRef} className="mx-auto w-full max-w-sm" />
                    {paypalState === 'loading' || paypalState === 'idle' ? (
                      <div className="flex h-full min-h-[160px] items-center justify-center text-white/48">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading PayPal and card options...
                      </div>
                    ) : null}
                    {paypalState === 'error' ? (
                      <div className="flex min-h-[160px] flex-col items-center justify-center text-center text-white/56">
                        <p className="max-w-sm text-sm leading-6">
                          PayPal did not load correctly. Retry once and the buttons should appear.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4 rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                          onClick={() => setPaypalRenderNonce((value) => value + 1)}
                        >
                          Retry PayPal
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <p className="mt-4 text-center text-sm text-white/46">
                    Pay with PayPal or choose the direct debit / credit card button below it.
                  </p>
                  <p className="mt-4 text-center text-xs text-white/34">
                    By continuing, you agree to our Terms of Service.
                  </p>
                </motion.div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
