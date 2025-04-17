
interface PaystackPopInterface {
  setup(options: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref: string;
    callback: (response: any) => void;
    onClose: () => void;
    [key: string]: any;
  }): {
    openIframe: () => void;
  };
}

declare global {
  interface Window {
    PaystackPop: PaystackPopInterface;
  }
}

export {};
