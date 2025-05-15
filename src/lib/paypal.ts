
// PayPal utility functions and types

export const CLIENT_ID = 'ARrwQMysQqyFM7j3lPuiPnUII7WXGkNWzBLTdVm2HvVUa-shV1LA0EMANtgTSMKWa-UQ-Leig0VywPD7';
export const PLAN_ID = 'P-3CD17662R8975905JNASUSYA';

// Initialize PayPal script in main app
export function initializePayPalScript() {
  if (window.paypal || document.querySelector('script[src*="paypal.com/sdk/js"]')) {
    console.log('PayPal script already loaded');
    return;
  }
  
  const script = document.createElement('script');
  script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&vault=true&intent=subscription`;
  script.async = true;
  script.setAttribute('data-sdk-integration-source', 'button-factory');
  
  document.body.appendChild(script);
  console.log('PayPal subscription script added to document');
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
