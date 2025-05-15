
// PayPal utility functions and types
import { useState, useEffect } from "react";

export const CLIENT_ID = 'ARrwQMysQqyFM7j3lPuiPnUII7WXGkNWzBLTdVm2HvVUa-shV1LA0EMANtgTSMKWa-UQ-Leig0VywPD7';
export const PLAN_ID = 'P-3CD17662R8975905JNASUSYA';

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
    script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&vault=true&intent=subscription&components=buttons`;
    script.async = true;
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    
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
