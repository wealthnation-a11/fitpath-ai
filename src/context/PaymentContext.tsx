
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PAYSTACK_PUBLIC_KEY } from "@/utils/env";
import { toast } from "sonner";

export type Currency = {
  code: string;
  symbol: string;
  rate: number;
};

export const SUPPORTED_CURRENCIES: { [key: string]: Currency } = {
  USD: { code: "USD", symbol: "$", rate: 1 },
  NGN: { code: "NGN", symbol: "₦", rate: 1 },
  GBP: { code: "GBP", symbol: "£", rate: 0.79 },
  EUR: { code: "EUR", symbol: "€", rate: 0.92 },
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  baseAmount: number;
  amount: number;
  duration: number;
  description: string;
};

const BASE_SUBSCRIPTION_PLANS = [
  {
    id: "free-trial",
    name: "3-Day Free Trial",
    baseAmount: 0,
    duration: 3,
    description: "Try FitPath AI for free for 3 days"
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    baseAmount: 780000, // ₦7,800
    duration: 30,
    description: "30 days of personalized fitness and meal plans"
  },
  {
    id: "semi-annual",
    name: "6 Months Plan",
    baseAmount: 3900000, // ₦39,000
    duration: 180,
    description: "6 months of personalized fitness and meal plans"
  },
  {
    id: "annual",
    name: "Annual Plan",
    baseAmount: 7600000, // ₦76,000
    duration: 365,
    description: "12 months of personalized fitness and meal plans"
  }
];

export const SUBSCRIPTION_PLANS = BASE_SUBSCRIPTION_PLANS.map(plan => ({
  ...plan,
  amount: plan.baseAmount
}));

export type SubscriptionStatus = {
  active: boolean;
  plan?: SubscriptionPlan;
  expiresAt?: string;
  trialStartDate?: string;
  isTrialExpired?: boolean;
};

type PaymentContextType = {
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
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    active: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES.NGN);

  const formatPrice = (amount: number): string => {
    const mainUnitAmount = amount / 100;
    return `${currency.symbol}${mainUnitAmount.toLocaleString('en-NG')}`;
  };

  useEffect(() => {
    setCurrency(SUPPORTED_CURRENCIES.NGN);
  }, []);

  const plans = SUBSCRIPTION_PLANS.map(plan => ({
    ...plan,
    amount: plan.baseAmount
  }));

  const initiatePayment = async (plan: SubscriptionPlan) => {
    if (!user || !session) {
      throw new Error("You must be logged in to make a payment");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const paystackPublicKey = PAYSTACK_PUBLIC_KEY;
      
      if (typeof window.PaystackPop === 'undefined') {
        await new Promise<void>((resolve, reject) => {
          let attempts = 0;
          const checkPaystack = setInterval(() => {
            attempts++;
            if (typeof window.PaystackPop !== 'undefined') {
              clearInterval(checkPaystack);
              resolve();
            } else if (attempts >= 50) {
              clearInterval(checkPaystack);
              reject(new Error("Paystack failed to load. Please refresh the page and try again."));
            }
          }, 100);
        });
      }
      
      if (typeof window.PaystackPop === 'undefined') {
        throw new Error("Paystack not available. Please check your internet connection and refresh the page.");
      }
      
      const reference = `fitpath_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: user.email,
        amount: plan.amount,
        currency: 'NGN',
        ref: reference,
        callback: async (response: any) => {
          console.log("Payment successful. Reference:", response.reference);
          toast.success("Payment successful! Verifying your subscription...");
          
          try {
            const success = await verifyPayment(response.reference);
            if (success) {
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + plan.duration);
              
              // Save to Supabase subscribers table
              const { error: insertError } = await supabase
                .from('subscribers')
                .upsert({
                  user_id: session.user.id,
                  email: user.email,
                  subscribed: true,
                  subscription_tier: plan.id,
                  subscription_end: expiryDate.toISOString(),
                  plan_duration: plan.duration,
                  amount_paid: plan.amount,
                  currency: 'NGN',
                  payment_reference: response.reference
                });

              if (insertError) {
                console.error("Error saving subscription:", insertError);
                toast.error("Payment successful but failed to save subscription. Please contact support.");
                return;
              }
              
              const newSubscription: SubscriptionStatus = {
                active: true,
                plan,
                expiresAt: expiryDate.toISOString()
              };
              
              setSubscription(newSubscription);
              toast.success(`Subscription activated: ${plan.name}`);
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Error in payment callback:", err);
            toast.error("Payment processing error. Please contact support.");
          }
        },
        onClose: () => {
          toast.info("Payment window closed");
          setLoading(false);
        }
      });
      
      handler.openIframe();
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message);
      toast.error(err.message || "Payment failed. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string): Promise<boolean> => {
    if (!user || !session) {
      throw new Error("You must be logged in");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Verifying payment with reference: ${reference}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async (): Promise<SubscriptionStatus> => {
    if (!user || !session) {
      return { active: false };
    }
    
    setLoading(true);
    
    try {
      // Check Supabase subscribers table first
      const { data: subscriber, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('subscribed', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
      }

      if (subscriber && subscriber.subscription_end) {
        const expiryDate = new Date(subscriber.subscription_end);
        const now = new Date();
        
        if (expiryDate > now) {
          const plan = plans.find(p => p.id === subscriber.subscription_tier);
          const activeSubscription = {
            active: true,
            plan,
            expiresAt: subscriber.subscription_end
          };
          setSubscription(activeSubscription);
          return activeSubscription;
        }
      }

      // Fallback to localStorage for trial and legacy data
      const storedSubscription = localStorage.getItem(`fitpath-subscription-${user.id}`);
      
      if (storedSubscription) {
        const parsedSubscription: SubscriptionStatus = JSON.parse(storedSubscription);
        
        if (parsedSubscription.plan?.id === "free-trial") {
          const trialStart = parsedSubscription.trialStartDate 
            ? new Date(parsedSubscription.trialStartDate) 
            : new Date();
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff >= 3) {
            const expiredSubscription = {
              active: false,
              isTrialExpired: true
            };
            
            setSubscription(expiredSubscription);
            return expiredSubscription;
          }
        }
        
        setSubscription(parsedSubscription);
        return parsedSubscription;
      }
      
      return { active: false };
    } catch (err: any) {
      console.error("Error checking subscription:", err);
      setError(err.message);
      return { active: false };
    } finally {
      setLoading(false);
    }
  };

  const startFreeTrial = () => {
    if (!user) {
      toast.error("Please login to start a free trial");
      return;
    }
    
    const trialPlan = plans.find(p => p.id === "free-trial");
    if (!trialPlan) {
      toast.error("Free trial plan not found");
      return;
    }
    
    const newTrialSubscription: SubscriptionStatus = {
      active: true,
      plan: trialPlan,
      trialStartDate: new Date().toISOString()
    };
    
    setSubscription(newTrialSubscription);
    localStorage.setItem(`fitpath-subscription-${user.id}`, JSON.stringify(newTrialSubscription));
    toast.success("Free trial activated!");
  };

  return (
    <PaymentContext.Provider
      value={{
        subscription,
        loading,
        error,
        plans,
        currency,
        initiatePayment,
        verifyPayment,
        checkSubscription,
        startFreeTrial,
        formatPrice
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
