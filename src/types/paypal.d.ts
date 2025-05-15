
interface PayPalNamespace {
  Buttons: (config: any) => {
    render: (container: HTMLElement | string) => Promise<void>;
  };
}

interface Window {
  paypal?: PayPalNamespace;
}
