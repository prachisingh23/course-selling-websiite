import React, { useEffect, useRef, useState } from 'react';
import { ADSENSE_CLIENT_ID, ADSENSE_DEFAULT_SLOT_ID } from '@/config/adsense';
import { cn } from '@/lib/utils';

let adsenseScriptPromise = null;

const loadAdSenseScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('AdSense can only load in the browser.'));
  }

  if (window.adsbygoogle) {
    return Promise.resolve(window.adsbygoogle);
  }

  if (adsenseScriptPromise) {
    return adsenseScriptPromise;
  }

  adsenseScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('adsense-script');

    const handleLoad = () => resolve(window.adsbygoogle || []);
    const handleError = () => {
      adsenseScriptPromise = null;
      reject(new Error('Failed to load AdSense script.'));
    };

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.id = 'adsense-script';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.onload = handleLoad;
    script.onerror = handleError;
    document.head.appendChild(script);
  });

  return adsenseScriptPromise;
};

const GoogleAd = ({ adSlot = ADSENSE_DEFAULT_SLOT_ID, className }) => {
  const adRef = useRef(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isContainerVisible, setIsContainerVisible] = useState(true);

  useEffect(() => {
    const adElement = adRef.current;
    if (!adElement) return;

    let observer;
    let pushFrame = null;

    const markAdAsLoaded = () => {
      setIsAdLoaded(true);
      setIsContainerVisible(true);
    };

    const attemptPush = async () => {
      try {
        await loadAdSenseScript();

        if (adElement.dataset.adsbygoogleStatus === 'done') {
          markAdAsLoaded();
          return;
        }

        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('AdSense push skipped:', error);
        }
        setIsContainerVisible(false);
      }
    };

    pushFrame = window.requestAnimationFrame(() => {
      attemptPush();
    });

    const fallbackTimeout = setTimeout(() => {
      const hasRenderedFrame = adElement.querySelector('iframe');
      const hasFilledStatus = adElement.getAttribute('data-ad-status') === 'filled';

      if (!hasRenderedFrame && !hasFilledStatus) {
        setIsContainerVisible(false);
      }
    }, 5000);

    observer = new MutationObserver(() => {
      const hasRenderedFrame = adElement.querySelector('iframe');
      const hasFilledStatus = adElement.getAttribute('data-ad-status') === 'filled';

      if (hasRenderedFrame || hasFilledStatus) {
        markAdAsLoaded();
        clearTimeout(fallbackTimeout);
        observer?.disconnect();
      }
    });

    observer.observe(adElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer?.disconnect();
      clearTimeout(fallbackTimeout);
      if (pushFrame != null) {
        window.cancelAnimationFrame(pushFrame);
      }
    };
  }, [adSlot]);

  const ShimmerPlaceholder = () => (
    <div className="h-52 w-full animate-pulse rounded-[24px] bg-white/[0.04]" />
  );

  return (
    isContainerVisible ? (
      <div
        className={cn(
          'media-panel-soft my-8 overflow-hidden text-center transition-all duration-300',
          isAdLoaded ? 'p-4' : 'p-3',
          className
        )}
        style={isAdLoaded ? undefined : { minHeight: 208 }}
      >
        <div className="relative min-h-[208px]">
          {!isAdLoaded ? (
            <div className="pointer-events-none absolute inset-0">
              <ShimmerPlaceholder />
            </div>
          ) : null}
          <ins
            ref={adRef}
            className={cn(
              'adsbygoogle transition-opacity duration-300',
              isAdLoaded ? 'opacity-100' : 'opacity-0',
            )}
            style={{ display: 'block', width: '100%', minHeight: 208 }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    ) : null
  );
};

export default GoogleAd;
