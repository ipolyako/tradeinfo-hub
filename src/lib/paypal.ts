
// PayPal utility functions and types
import { useEffect, useState } from 'react';

export interface PayPalButtonsConfig {
  style: {
    layout: 'vertical' | 'horizontal';
    color: 'gold' | 'blue' | 'silver' | 'black';
    shape: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment' | 'subscribe';
    height?: number;
  };
  createSubscription: (data: any, actions: any) => Promise<string>;
  onApprove: (data: any, actions?: any) => void;
  onError: (err: any) => void;
  onCancel: () => void;
}

interface PayPalScriptOptions {
  clientId: string;
  components?: string;
  currency?: string;
  intent?: string;
}

// Your actual plan ID for the $200 subscription
export const PLAN_ID = 'P-64T954128V783625HL3ITKJY';
export const CLIENT_ID = 'AehBHwNlULYPYFGpYzx1kxtEEha4Fw1rvUgx1xv8kNwyYZA0Dqi7H0M2YDxpTn-2v7A-houXY4xlzY2I';

export function usePayPalScript(options: PayPalScriptOptions) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If script is already loaded, don't load it again
    if (window.paypal) {
      setLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = constructPayPalScriptUrl(options);
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
    console.log('PayPal script added to document:', script.src);
    
    return () => {
      if (document.body.contains(script)) {
        script.removeEventListener('load', onScriptLoad);
        script.removeEventListener('error', onScriptError);
        document.body.removeChild(script);
      }
    };
  }, [options.clientId, options.components, options.currency]);

  return { loaded, error };
}

function constructPayPalScriptUrl(options: PayPalScriptOptions): string {
  const params = new URLSearchParams();
  
  // Required parameters
  params.append('client-id', options.clientId);
  
  // Optional parameters
  if (options.components) params.append('components', options.components);
  if (options.currency) params.append('currency', options.currency);
  if (options.intent) params.append('intent', options.intent);
  
  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}
