export type Currency = {
  code: string;
  symbol: string;
  rate: number;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  baseAmount: number;
  amount: number;
  duration: number;
  description: string;
  displayName: string;
};

export type SubscriptionStatus = {
  active: boolean;
  plan?: SubscriptionPlan;
  expiresAt?: string;
  trialStartDate?: string;
  isTrialExpired?: boolean;
};

export type PaymentContextType = {
  subscription: SubscriptionStatus;
  loading: boolean;
  error: string | null;
  plans: SubscriptionPlan[];
  currency: Currency;
  initiatePayment: (plan: SubscriptionPlan) => Promise<void>;
  verifyPayment: (reference: string) => Promise<boolean>;
  checkSubscription: () => Promise<SubscriptionStatus>;
  startFreeTrial: () => void;
  formatPrice: (amount: number) => string;
  resetPaymentState: () => void;
  upgradeUser: (plan: SubscriptionPlan, reference: string) => Promise<void>;
  showCancelMessage: () => void;
};

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: (response: any) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}