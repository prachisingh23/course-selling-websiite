import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import razorpayService from '@/services/razorpayService';
import paypalService from '@/services/paypalService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/useAuth';

const PaymentComponent = ({ amount, itemName, onPaymentSuccess, onPaymentError }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState({ razorpay: false, paypal: false });
    const paypalRef = useRef(null);

    useEffect(() => {
        // Initialize PayPal buttons when component mounts or amount changes
        if (paypalRef.current) {
            paypalRef.current.innerHTML = ''; // Clean up previous buttons
            
            if (paypalService && typeof paypalService.renderPayPalButtons === 'function') {
                paypalService.renderPayPalButtons(
                    "paypal-component-container",
                    amount,
                    'USD', 
                    (details) => {
                        console.log("PayPal payment success details:", details);
                        toast({ title: "PayPal Payment Successful!" });
                        if (onPaymentSuccess) {
                            onPaymentSuccess({
                                ...details,
                                payment_method: 'paypal'
                            });
                        }
                    },
                    (err) => {
                        console.error("PayPal error:", err);
                        toast({ variant: "destructive", title: "PayPal Payment Failed" });
                        if (onPaymentError) onPaymentError(err);
                    }
                ).catch(err => {
                    console.error("Failed to render PayPal buttons in PaymentComponent:", err);
                });
            }
        }
    }, [amount, itemName, onPaymentSuccess, onPaymentError, toast]);

    const handleRazorpayPayment = async () => {
        setLoading(prev => ({ ...prev, razorpay: true }));
        try {
            // Securely create order via Edge Function (server-side)
            const orderId = await razorpayService.createRazorpayOrder(amount, 'INR');
            
            const options = razorpayService.createPaymentOptions(
                amount,
                'INR',
                itemName || 'Lifelapss Purchase',
                `Purchase of ${itemName || 'Course'}`,
                orderId
            );

            if (user) {
                options.prefill = {
                    name: user.user_metadata?.full_name || '',
                    email: user.email || '',
                    contact: user.phone || ''
                };
            }

            const paymentResponse = await razorpayService.initializePayment(options);
            
            toast({ title: 'Razorpay Payment Successful!' });
            if (onPaymentSuccess) {
                onPaymentSuccess({
                    ...paymentResponse,
                    payment_method: 'razorpay'
                });
            }
        } catch (error) {
            console.error("Razorpay Error:", error);
            const errorMessage = error.code === 'PAYMENT_CANCELLED' 
                ? 'Payment was cancelled.' 
                : (error.description || 'An unknown error occurred.');
            
            toast({ variant: 'destructive', title: 'Payment Failed', description: errorMessage });
            if (onPaymentError) onPaymentError(error);
        } finally {
            setLoading(prev => ({ ...prev, razorpay: false }));
        }
    };

    return (
        <div className="media-panel-soft mx-auto w-full max-w-md space-y-6 p-6">
            <div className="mb-2 text-center">
                <p className="text-sm uppercase tracking-[0.26em] text-cyan-100/62">{itemName}</p>
                <p className="premium-gradient-text mt-3 text-4xl font-bold">${amount}</p>
            </div>
            
            <Tabs defaultValue="paypal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                    <TabsTrigger value="paypal" className="rounded-xl text-white/68 data-[state=active]:bg-cyan-300/18 data-[state=active]:text-white">PayPal / Card</TabsTrigger>
                    <TabsTrigger value="razorpay" className="rounded-xl text-white/68 data-[state=active]:bg-cyan-300/18 data-[state=active]:text-white">Razorpay (India)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="paypal" className="mt-4">
                     <div id="paypal-component-container" ref={paypalRef} className="min-h-[150px] w-full rounded-[24px] bg-white p-4"></div>
                </TabsContent>
                
                <TabsContent value="razorpay" className="mt-4">
                    <button
                        onClick={handleRazorpayPayment}
                        disabled={loading.razorpay}
                        className="premium-button flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50"
                    >
                        {loading.razorpay ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Pay with Razorpay'
                        )}
                    </button>
                    <p className="mt-3 text-center text-xs text-white/48">
                        Secure payment processed by Razorpay
                    </p>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PaymentComponent;
