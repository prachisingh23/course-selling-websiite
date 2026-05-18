// ✅ Universal PayPal Service – handles automatic currency conversion
// You always charge in USD, PayPal auto-converts for buyer country.

const paypalService = {
  sdkPromise: null,

  // ✅ Load PayPal SDK (only once)
  initializeSDK: () => {
    if (window.paypal) {
      return Promise.resolve(window.paypal);
    }

    if (paypalService.sdkPromise) {
      return paypalService.sdkPromise;
    }

    paypalService.sdkPromise = new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
      if (!clientId) {
        console.warn('PayPal Client ID missing in .env');
        paypalService.sdkPromise = null;
        reject(new Error('PayPal Client ID missing'));
        return;
      }

      const handleLoad = () => {
        if (window.paypal) {
          console.log('✅ PayPal SDK loaded successfully');
          resolve(window.paypal);
        } else {
          paypalService.sdkPromise = null;
          reject(new Error('PayPal SDK failed to load'));
        }
      };

      const handleError = () => {
        paypalService.sdkPromise = null;
        reject(new Error('Failed to load PayPal SDK'));
      };

      const existingScript = document.querySelector('script[data-paypal-sdk="true"]');

      if (existingScript) {
        existingScript.addEventListener('load', handleLoad, { once: true });
        existingScript.addEventListener('error', handleError, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons`;
      script.async = true;
      script.defer = true;
      script.dataset.paypalSdk = 'true';

      script.onload = handleLoad;
      script.onerror = handleError;

      document.body.appendChild(script);
    });

    return paypalService.sdkPromise;
  },

  // ✅ Create payment structure
  createPaymentOptions: (amount, description = "Course Payment") => {
    return {
      purchase_units: [
        {
          amount: {
            currency_code: "USD", // 💵 Always USD
            value: amount.toString(),
          },
          description,
        },
      ],
    };
  },

  buildButtonConfig: (paypal, amount, onSuccess, onError, fundingSource = undefined) => ({
    fundingSource,
    style: {
      layout: 'vertical',
      color: fundingSource === paypal.FUNDING.CARD ? 'white' : 'gold',
      shape: 'rect',
      label: fundingSource === paypal.FUNDING.CARD ? 'pay' : 'paypal',
      height: 48,
      tagline: false,
    },

    createOrder: (_data, actions) => {
      return actions.order.create(paypalService.createPaymentOptions(amount));
    },

    onApprove: (data, actions) => {
      return actions.order.capture().then((details) => {
        console.log('✅ PayPal Payment Successful:', details);
        if (typeof onSuccess === 'function') {
          onSuccess({
            paypal_order_id: data.orderID,
            paypal_payment_id: details.id,
            payer_email: details.payer.email_address,
            payer_name: details.payer.name.given_name,
            status: details.status,
          });
        }
      });
    },

    onError: (err) => {
      console.error('❌ PayPal Error:', err);
      if (typeof onError === 'function') onError(err);
    },
  }),

  // ✅ Render PayPal Buttons
  // IMPORTANT: This function MUST return a Promise to allow .then() chaining
  renderPayPalButtons: (containerId, amount, _currency, onSuccess, onError) => {
    return new Promise((resolve, reject) => {
      paypalService
        .initializeSDK()
        .then((paypal) => {
          const container = document.getElementById(containerId);
          if (!container) {
             console.warn(`PayPal container #${containerId} not found`);
             resolve(); // Resolve gracefully if container is missing (e.g. tab switch)
             return;
          }
          
          // Clear container to prevent duplicate buttons
          container.innerHTML = "";

          const stack = document.createElement('div');
          stack.style.display = 'grid';
          stack.style.gap = '12px';

          const walletContainer = document.createElement('div');
          const cardContainer = document.createElement('div');
          const walletContainerId = `${containerId}-paypal`;
          const cardContainerId = `${containerId}-card`;

          walletContainer.id = walletContainerId;
          cardContainer.id = cardContainerId;

          stack.appendChild(walletContainer);
          stack.appendChild(cardContainer);
          container.appendChild(stack);

          const renderFundingSource = async (fundingSource, targetId) => {
            const button = paypal.Buttons(
              paypalService.buildButtonConfig(paypal, amount, onSuccess, onError, fundingSource)
            );

            if (!button.isEligible()) {
              const target = document.getElementById(targetId);
              if (target) {
                target.remove();
              }
              return false;
            }

            await button.render(`#${targetId}`);
            return true;
          };

          Promise.allSettled([
            renderFundingSource(paypal.FUNDING.PAYPAL, walletContainerId),
            renderFundingSource(paypal.FUNDING.CARD, cardContainerId),
          ])
            .then((results) => {
              const renderedCount = results.filter(
                (result) => result.status === 'fulfilled' && result.value
              ).length;

              if (renderedCount === 0) {
                reject(new Error('No PayPal funding sources were eligible to render.'));
                return;
              }

              resolve();
            })
            .catch((err) => {
              console.error('PayPal render error:', err);
              reject(err);
            });
        })
        .catch((error) => {
          console.error("❌ PayPal SDK initialization failed:", error);
          if (typeof onError === "function") onError(error);
          reject(error);
        });
    });
  },
};

export default paypalService;
