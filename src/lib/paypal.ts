
// PayPal utility functions and types
import { useEffect, useState } from 'react';

export const CLIENT_ID = 'AehBHwNlULYPYFGpYzx1kxtEEha4Fw1rvUgx1xv8kNwyYZA0Dqi7H0M2YDxpTn-2v7A-houXY4xlzY2I';

// Initialize PayPal script in main app
export function initializePayPalScript() {
  if (window.paypal || document.querySelector('script[src*="paypal.com/sdk/js"]')) {
    console.log('PayPal script already loaded');
    return;
  }
  
  const script = document.createElement('script');
  script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD`;
  script.async = true;
  
  document.body.appendChild(script);
  console.log('PayPal script added to document');
}

// Legacy hook kept for backward compatibility
export function usePayPalScript(options: any) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (window.paypal) {
      setLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${options.clientId}&currency=USD`;
    script.async = true;
    
    const onScriptLoad = () => {
      console.log('PayPal script loaded successfully');
      setLoaded(true);
    };
    
    const onScriptError = () => {
      console.error('Failed to load PayPal script');
      setError(new Error('Failed to load PayPal script'));
    };
    
    script.addEventListener('load', onScriptLoad);
    script.addEventListener('error', onScriptError);
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        script.removeEventListener('load', onScriptLoad);
        script.removeEventListener('error', onScriptError);
        document.body.removeChild(script);
      }
    };
  }, [options.clientId]);

  return { loaded, error };
}
