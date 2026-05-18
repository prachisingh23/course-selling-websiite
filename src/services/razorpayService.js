import { supabase } from '@/lib/customSupabaseClient';

// Get Razorpay key from environment variables
const getRazorpayKey = () => {
  return import.meta.env.VITE_RAZORPAY_KEY_ID;
};

// Create a Razorpay order by calling the Supabase Edge Function
const createRazorpayOrder = async (amount, currency) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: JSON.stringify({ amount, currency }),
    });

    if (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Could not create Razorpay order.');
    }

    return data.id; // Return the order ID
  } catch (err) {
    console.error("Razorpay Order Creation Exception:", err);
    throw err;
  }
};

// Initialize payment with Razorpay
const initializePayment = (options) => {
  return new Promise((resolve, reject) => {
    const key = getRazorpayKey();
    
    if (!key) {
        reject(new Error("Razorpay Key ID is missing. Please check your environment variables."));
        return;
    }

    // Check if Razorpay script is loaded
    if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
             // Retry initialization after script load
             const rzp = new window.Razorpay({
                ...options,
                key: key,
                handler: function (response) {
                    resolve(response);
                },
                modal: {
                    ondismiss: function() {
                    reject({ code: 'PAYMENT_CANCELLED', description: 'Payment was cancelled by user.' });
                    }
                }
            });
            rzp.on('payment.failed', function (response) {
                reject(response.error);
            });
            rzp.open();
        };
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
        document.body.appendChild(script);
    } else {
        const rzp = new window.Razorpay({
            ...options,
            key: key,
            handler: function (response) {
                resolve(response);
            },
            modal: {
                ondismiss: function() {
                reject({ code: 'PAYMENT_CANCELLED', description: 'Payment was cancelled by user.' });
                }
            }
        });

        rzp.on('payment.failed', function (response) {
            reject(response.error);
        });

        rzp.open();
    }
  });
};

// Create payment options
const createPaymentOptions = (amount, currency = 'INR', name, description, orderId = null) => {
  return {
    amount: Math.round(amount * 100), // Razorpay expects amount in paise (integer)
    currency,
    name,
    description,
    order_id: orderId,
    prefill: {
      name: '',
      email: '',
      contact: ''
    },
    theme: {
      color: '#7C3AED', // Purple color matching the app theme
    }
  };
};

const razorpayService = {
  createRazorpayOrder,
  initializePayment,
  createPaymentOptions
};

export default razorpayService;