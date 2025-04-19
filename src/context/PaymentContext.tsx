
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { PAYSTACK_PUBLIC_KEY } from "@/utils/env";
import { toast } from "sonner";

export type Currency = {
  code: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD
};

export const SUPPORTED_CURRENCIES: { [key: string]: Currency } = {
  USD: { code: "USD", symbol: "$", rate: 1 },
  NGN: { code: "NGN", symbol: "₦", rate: 780 }, // 780 NGN = 1 USD
  GBP: { code: "GBP", symbol: "£", rate: 0.79 }, // 0.79 GBP = 1 USD
  EUR: { code: "EUR", symbol: "€", rate: 0.92 }, // 0.92 EUR = 1 USD
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  baseAmount: number; // Base amount in USD cents
  amount: number; // Amount in local currency (cents/kobo)
  duration: number; // in days
  description: string;
};

// Base prices in USD and NGN
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
  amount: plan.baseAmount // Initialize with same value, will be adjusted based on currency
}));

export type SubscriptionStatus = {
  active: boolean;
  plan?: SubscriptionPlan;
  expiresAt?: string;
  trialStartDate?: string; // Add trial start tracking
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
  startFreeTrial: () => void; // New function to start a free trial
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    active: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES.USD);

  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        
        // Map country codes to currencies
        const currencyMap: { [key: string]: string } = {
          NG: 'NGN',
          US: 'USD',
          GB: 'GBP',
          // Add more country to currency mappings as needed
          // Default to USD for unsupported countries
        };

        const currencyCode = currencyMap[countryCode] || 'USD';
        setCurrency(SUPPORTED_CURRENCIES[currencyCode]);
      } catch (error) {
        console.error('Error detecting location:', error);
        // Default to USD if location detection fails
        setCurrency(SUPPORTED_CURRENCIES.USD);
      }
    };

    detectUserCurrency();
  }, []);

  // Calculate prices in local currency
  const plans = BASE_SUBSCRIPTION_PLANS.map(plan => ({
    ...plan,
    amount: Math.round(plan.baseAmount * currency.rate)
  }));

  const initiatePayment = async (plan: SubscriptionPlan) => {
    if (!user) {
      throw new Error("You must be logged in to make a payment");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would make a backend call to initialize Paystack
      // Using the public key on the frontend and the secret key on the backend
      const paystackPublicKey = PAYSTACK_PUBLIC_KEY;
      
      // Check if Paystack is loaded
      if (typeof window.PaystackPop === 'undefined') {
        // Wait for Paystack to load (max 5 seconds)
        await new Promise<void>((resolve, reject) => {
          let attempts = 0;
          const checkPaystack = setInterval(() => {
            attempts++;
            if (typeof window.PaystackPop !== 'undefined') {
              clearInterval(checkPaystack);
              resolve();
            } else if (attempts >= 50) { // 5 seconds (100ms * 50)
              clearInterval(checkPaystack);
              reject(new Error("Paystack failed to load. Please refresh the page and try again."));
            }
          }, 100);
        });
      }
      
      // Ensure Paystack is available
      if (typeof window.PaystackPop === 'undefined') {
        throw new Error("Paystack not available. Please check your internet connection and refresh the page.");
      }
      
      // Generate a unique reference
      const reference = `fitpath_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      // Initialize Paystack
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: user.email,
        amount: plan.amount, // in kobo
        currency: 'NGN',
        ref: reference,
        callback: (response: any) => {
          console.log("Payment successful. Reference:", response.reference);
          toast.success("Payment successful! Verifying your subscription...");
          
          // Verify payment
          verifyPayment(response.reference)
            .then((success) => {
              if (success) {
                // Update subscription
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + plan.duration);
                
                const newSubscription: SubscriptionStatus = {
                  active: true,
                  plan,
                  expiresAt: expiryDate.toISOString()
                };
                
                setSubscription(newSubscription);
                localStorage.setItem(`fitpath-subscription-${user.id}`, JSON.stringify(newSubscription));
                toast.success(`Subscription activated: ${plan.name}`);
              } else {
                toast.error("Payment verification failed. Please contact support.");
              }
            });
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

  // In a real implementation, this would make a call to your backend API
  // which would verify the transaction with Paystack using the secret key
  const verifyPayment = async (reference: string): Promise<boolean> => {
    if (!user) {
      throw new Error("You must be logged in");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call your backend API
      // For this mock, we'll simulate a successful verification
      
      console.log(`Verifying payment with reference: ${reference}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll assume the payment was successful
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if the user has an active subscription
  const checkSubscription = async (): Promise<SubscriptionStatus> => {
    if (!user) {
      return { active: false };
    }
    
    setLoading(true);
    
    try {
      const storedSubscription = localStorage.getItem(`fitpath-subscription-${user.id}`);
      
      if (storedSubscription) {
        const parsedSubscription: SubscriptionStatus = JSON.parse(storedSubscription);
        
        // Check if this is a free trial
        if (parsedSubscription.plan?.id === "free-trial") {
          const trialStart = parsedSubscription.trialStartDate 
            ? new Date(parsedSubscription.trialStartDate) 
            : new Date();
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
          
          // Check if trial has expired
          if (daysDiff >= 3) {
            const expiredSubscription = {
              active: false,
              isTrialExpired: true
            };
            
            setSubscription(expiredSubscription);
            localStorage.setItem(`fitpath-subscription-${user.id}`, JSON.stringify(expiredSubscription));
            return expiredSubscription;
          }
        }
        
        // Check if regular subscription has expired
        if (parsedSubscription.expiresAt) {
          const expiryDate = new Date(parsedSubscription.expiresAt);
          const now = new Date();
          
          if (expiryDate < now) {
            const expiredSubscription = {
              active: false
            };
            
            setSubscription(expiredSubscription);
            localStorage.setItem(`fitpath-subscription-${user.id}`, JSON.stringify(expiredSubscription));
            return expiredSubscription;
          }
        }
        
        setSubscription(parsedSubscription);
        return parsedSubscription;
      }
      
      return { active: false };
    } catch (err: any) {
      setError(err.message);
      return { active: false };
    } finally {
      setLoading(false);
    }
  };

  // New function to start a free trial
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
        startFreeTrial
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
