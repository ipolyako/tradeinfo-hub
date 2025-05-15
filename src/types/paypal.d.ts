
declare interface Window {
  paypal: {
    Buttons: (config: {
      style?: {
        layout?: 'vertical' | 'horizontal';
        color?: 'gold' | 'blue' | 'silver' | 'black';
        shape?: 'rect' | 'pill';
        label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment' | 'subscribe';
        height?: number;
      };
      createSubscription?: (data: any, actions: any) => Promise<string>;
      onApprove?: (data: any, actions?: any) => void;
      onError?: (err: any) => void;
      onCancel?: () => void;
    }) => {
      render: (container: HTMLElement) => Promise<void>;
    };
  };
}
