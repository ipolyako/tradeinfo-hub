
declare interface Window {
  paypal: {
    Buttons: (config: any) => {
      render: (container: HTMLElement) => Promise<void>;
    };
  };
}
