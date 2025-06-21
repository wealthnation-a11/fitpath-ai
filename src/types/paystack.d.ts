
interface PaystackResponse {
  status: 'success' | 'failed' | 'cancelled';
  reference: string;
  message: string;
  trans: string;
  transaction: string;
  trxref: string;
  redirecturl: string;
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  channels?: string[];
  plan?: string;
  quantity?: number;
  subaccount?: string;
  transaction_charge?: number;
  bearer?: 'account' | 'subaccount';
  label?: string;
}

interface PaystackHandler {
  openIframe: () => void;
}

interface PaystackPopInterface {
  setup(config: PaystackConfig): PaystackHandler;
}

declare global {
  interface Window {
    PaystackPop: PaystackPopInterface;
  }
}

export {};
