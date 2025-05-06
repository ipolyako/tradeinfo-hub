
interface PayPalButtonsComponentOptions {
  style?: {
    shape?: 'rect' | 'pill';
    color?: 'gold' | 'blue' | 'silver' | 'black';
    layout?: 'vertical' | 'horizontal';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment' | 'subscribe';
  };
  createSubscription?: (data: any, actions: any) => Promise<string>;
  onApprove?: (data: any, actions?: any) => void;
  onError?: (err: any) => void;
  onCancel?: () => void;
}

interface PayPalNamespace {
  Buttons: (options: PayPalButtonsComponentOptions) => {
    render: (selector: string) => void;
  };
}

interface Window {
  paypal: PayPalNamespace;
}
