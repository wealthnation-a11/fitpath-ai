
interface PaystackPopInterface {
  setup(options: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref: string;
    callback: (response: {
      status: string;
      reference: string;
      [key: string]: any;
    }) => void;
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
