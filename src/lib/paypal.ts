
// PayPal utility functions and types
import { useEffect, useState } from 'react';

// Update the interface to match PayPal's actual types
export interface PayPalButtonsConfig {
  style: {
    layout: 'vertical' | 'horizontal';
    color: 'gold' | 'blue' | 'silver' | 'black';
    shape: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment' | 'subscribe';
    height?: number;
  };
  createSubscription?: (data: any, actions: any) => Promise<string>;
  onApprove: (data: any, actions?: any) => void;
  onError: (err: any) => void;
  onCancel: () => void;
}

interface PayPalScriptOptions {
  clientId: string;
  components?: string;
  currency?: string;
  intent?: string;
  vault?: boolean;
  dataClientToken?: string;
}

export const PLAN_ID = 'P-64T954128V783625HL3ITKJY';
export const CLIENT_ID = 'AehBHwNlULYPYFGpYzx1kxtEEha4Fw1rvUgx1xv8kNwyYZA0Dqi7H0M2YDxpTn-2v7A-houXY4xlzY2I';

export function usePayPalScript(options: PayPalScriptOptions) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Remove any existing PayPal script
    const existingScript = document.querySelector('script[data-namespace="paypal-sdk"]');
    if (existingScript) {
      document.body.removeChild(existingScript);
      // Also clear the global PayPal object to avoid conflicts
      if (window.paypal) {
        // @ts-ignore
        delete window.paypal;
      }
    }

    const script = document.createElement('script');
    script.src = constructPayPalScriptUrl(options);
    script.setAttribute('data-namespace', 'paypal-sdk');
    script.async = true;
    
    const onScriptLoad = () => setLoaded(true);
    const onScriptError = () => setError(new Error('Failed to load PayPal script'));
    
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
  if (options.vault) params.append('vault', 'true');
  if (options.dataClientToken) params.append('data-client-token', options.dataClientToken);
  
  params.append('data-sdk-integration-source', 'button-factory');
  
  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}
