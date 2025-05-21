
// PayPal utility functions and types
import { useState, useEffect } from "react";

// Use a default client ID since we can't access Supabase secrets in the browser
export const CLIENT_ID = 'AZ8TpbM9-Bn4ZuY7MLX1BZAkdmFeqKXrt3jNoW-RlDXgWAiSOovArA1hAVfKGH79lqYyA5qtpOVhskY8';

// Define plan IDs for each pricing tier
export const PLAN_IDS = {
  TIER_1: 'P-2CN78100KF703433HNAWT4XQ', // 1-50K
  TIER_2: 'P-88D90240DM691354JNAWTYRY', // 50K-100K
  TIER_3: 'P-8WP80283ES2853237NAWTZFQ'  // 100K-200K
};

// Legacy plan ID (kept for backward compatibility)
export const PLAN_ID = PLAN_IDS.TIER_1;

// Define PayPal button configuration types
export interface PayPalButtonConfig {
  style: {
    shape: "rect" | "pill";
    color: "gold" | "blue" | "silver" | "black";
    layout: "vertical" | "horizontal";
    label: "paypal" | "checkout" | "buynow" | "pay" | "installment" | "subscribe";
  };
  createSubscription: (data: any, actions: any) => any;
  onApprove: (data: any) => any;
  onError?: (err: any) => void;
  onCancel?: () => void;
}

// Check if browser is Firefox
export const isFirefox = () => {
  return typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};

// Initialize PayPal script in main app
export function initializePayPalScript() {
  return new Promise((resolve, reject) => {
    // Check if PayPal script is already loaded
    if (window.paypal) {
      console.log('PayPal script already loaded');
      resolve(window.paypal);
      return;
    }
    
    // If script is already being loaded, don't add another one
    if (document.querySelector('script[src*="paypal.com/sdk/js"]')) {
      console.log('PayPal script tag already exists, waiting for it to load');
      
      // Set a timeout to avoid infinite waiting
      const timeout = setTimeout(() => {
        reject(new Error('PayPal script loading timed out'));
      }, 10000);
      
      const checkPayPalInterval = setInterval(() => {
        if (window.paypal) {
          console.log('PayPal script loaded from existing script tag');
          clearInterval(checkPayPalInterval);
          clearTimeout(timeout);
          resolve(window.paypal);
        }
      }, 100);
      return;
    }
    
    // Create and add the script if it doesn't exist
    const script = document.createElement('script');
    
    // Add popup parameters specifically for Firefox to prevent automatic closing
    const firefoxParams = isFirefox() ? '&enable-funding=venmo&disable-funding=card' : '';
    
    // Add parameters to improve mobile compatibility
    const mobileParams = '&components=buttons,funding-eligibility';
    
    script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&vault=true&intent=subscription${firefoxParams}${mobileParams}`;
    script.async = true;
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.setAttribute('data-namespace', 'paypal');
    
    script.onload = () => {
      console.log('PayPal subscription script loaded successfully');
      resolve(window.paypal);
    };
    
    script.onerror = (err) => {
      console.error('Error loading PayPal script:', err);
      reject(new Error('Failed to load PayPal script'));
    };
    
    document.body.appendChild(script);
    console.log('PayPal subscription script added to document');
  });
}

// Legacy hook kept for backward compatibility
export function usePayPalScript(options: any) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initializePayPalScript()
      .then(() => setLoaded(true))
      .catch((err) => setError(err));
      
    return () => {
      // No cleanup needed as script should persist
    };
  }, [options?.clientId]);

  return { loaded, error };
}
