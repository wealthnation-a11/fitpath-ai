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
  displayName: string;
};

const BASE_SUBSCRIPTION_PLANS = [
  {
    id: "free-trial",
    name: "3-Day Free Trial",
    baseAmount: 0,
    duration: 3,
    description: "Try FitPath AI for free for 3 days",
    displayName: "Free Trial"
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    baseAmount: 780000, // ₦7,800 in kobo
    duration: 30,
    description: "30 days of personalized fitness and meal plans",
    displayName: "Monthly"
  },
  {
    id: "semi-annual",
    name: "6 Months Plan",
    baseAmount: 3900000, // ₦39,000 in kobo
    duration: 180,
    description: "6 months of personalized fitness and meal plans",
    displayName: "Semi-Annual"
  },
  {
    id: "annual",
    name: "Annual Plan",
    baseAmount: 7600000, // ₦76,000 in kobo
    duration: 365,
    description: "12 months of personalized fitness and meal plans",
    displayName: "Annual"
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
  resetPaymentState: () => void;
  upgradeUser: (plan: SubscriptionPlan, reference: string) => Promise<void>;
  showCancelMessage: () => void;
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

  const resetPaymentState = () => {
    console.log("Resetting payment state");
    setLoading(false);
    setError(null);
  };

  const upgradeUser = async (plan: SubscriptionPlan, reference: string) => {
    if (!user || !session) {
      throw new Error("User not authenticated");
    }

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.duration);

      const { error: updateError } = await supabase
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
          payment_reference: reference,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error("Error updating user subscription:", updateError);
        throw updateError;
      }

      const newSubscription: SubscriptionStatus = {
        active: true,
        plan,
        expiresAt: expiryDate.toISOString()
      };
      
      setSubscription(newSubscription);
      toast.success("🎉 Upgrade successful! Welcome to premium.");
      
      console.log("User upgraded successfully:", {
        plan: plan.displayName,
        reference,
        expiryDate: expiryDate.toISOString()
      });

    } catch (error) {
      console.error("Error in upgradeUser workflow:", error);
      throw error;
    }
  };

  const showCancelMessage = () => {
    toast.error("❌ Payment was cancelled. Try again anytime.");
    console.log("Payment cancelled by user");
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
      const errorMsg = "You must be logged in to make a payment";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (loading) {
      console.log("Payment already in progress, ignoring duplicate request");
      return;
    }

    console.log("Setting loading to true for payment initiation");
    setLoading(true);
    setError(null);
    
    try {
      console.log("Starting payment initiation for plan:", plan.name);
      
      if (!PAYSTACK_PUBLIC_KEY) {
        throw new Error("Payment system not configured. Please contact support.");
      }
      
      if (!PAYSTACK_PUBLIC_KEY.startsWith('pk_')) {
        throw new Error("Invalid Paystack public key format");
      }
      
      // Load Paystack script if not already loaded
      if (typeof window.PaystackPop === 'undefined') {
        console.log("Loading Paystack script...");
        
        const existingScript = document.querySelector('script[src*="paystack"]');
        if (existingScript) {
          existingScript.remove();
        }
        
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = () => {
            console.log("Paystack script loaded successfully");
            resolve(true);
          };
          script.onerror = () => {
            const err = new Error('Failed to load Paystack payment system');
            console.error(err);
            reject(err);
          };
          
          setTimeout(() => {
            reject(new Error('Paystack script loading timeout'));
          }, 10000);
        });
      }
      
      if (typeof window.PaystackPop === 'undefined') {
        throw new Error('Payment system failed to initialize. Please refresh and try again.');
      }
      
      const reference = `fitpath_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      console.log("Generated payment reference:", reference);
      
      const handlePaymentSuccess = (response: any) => {
        console.log("Payment callback received:", response);
        
        if (response.status === 'success' && response.reference) {
          console.log("Payment successful, running upgradeUser workflow");
          
          verifyPayment(response.reference).then((success) => {
            if (success) {
              upgradeUser(plan, response.reference).then(() => {
                setLoading(false);
                
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              }).catch((err) => {
                console.error("Error in upgradeUser workflow:", err);
                toast.error("Payment successful but failed to upgrade account. Please contact support.");
                setLoading(false);
              });
            } else {
              toast.error("Payment verification failed. Please contact support.");
              setLoading(false);
            }
          }).catch((err) => {
            console.error("Error in payment verification:", err);
            toast.error("Payment processing error. Please contact support.");
            setLoading(false);
          });
        } else {
          console.log("Payment not successful:", response);
          toast.error("Payment was not successful. Please try again.");
          setLoading(false);
        }
      };

      const handlePaymentClose = () => {
        console.log("Payment popup closed by user, running showCancelMessage workflow");
        setLoading(false);
        showCancelMessage();
      };
      
      console.log("Opening Paystack popup with proper callbacks");
      
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email || '',
        amount: plan.amount,
        currency: 'NGN',
        ref: reference,
        callback: handlePaymentSuccess,
        onClose: handlePaymentClose
      });
      
      if (!handler || typeof handler.openIframe !== 'function') {
        throw new Error('Failed to create payment handler');
      }
      
      handler.openIframe();
      
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      setError(err.message);
      setLoading(false);
      toast.error(err.message || "Payment failed to start. Please try again.");
    }
  };

  const verifyPayment = async (reference: string): Promise<boolean> => {
    if (!user || !session) {
      return false;
    }
    
    try {
      console.log(`Verifying payment with reference: ${reference}`);
      
      const { data, error } = await supabase.functions.invoke('verify-paystack-payment', {
        body: { reference }
      });

      if (error) {
        console.error("Payment verification error:", error);
        throw error;
      }

      if (data?.success) {
        console.log("Payment verified successfully:", data);
        return true;
      } else {
        console.error("Payment verification failed:", data);
        return false;
      }
    } catch (err: any) {
      console.error("Payment verification error:", err);
      setError(err.message);
      return false;
    }
  };

  const checkSubscription = async (): Promise<SubscriptionStatus> => {
    if (!user || !session) {
      return { active: false };
    }
    
    setLoading(true);
    
    try {
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
      
      const defaultSubscription = { active: false };
      setSubscription(defaultSubscription);
      return defaultSubscription;
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
        formatPrice,
        resetPaymentState,
        upgradeUser,
        showCancelMessage
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
