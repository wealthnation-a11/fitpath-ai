
import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { PAYSTACK_PUBLIC_KEY } from "@/utils/env";

export type SubscriptionPlan = {
  id: string;
  name: string;
  amount: number; // in kobo
  duration: number; // in days
  description: string;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free-trial",
    name: "3-Day Free Trial",
    amount: 0,
    duration: 3,
    description: "Try FitPath AI for free for 3 days"
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    amount: 780000, // ₦7,800 (converted from $5)
    duration: 30,
    description: "30 days of personalized fitness and meal plans"
  },
  {
    id: "semi-annual",
    name: "6 Months Plan",
    amount: 3900000, // ₦39,000 (converted from $25)
    duration: 180,
    description: "6 months of personalized fitness and meal plans"
  },
  {
    id: "annual",
    name: "Annual Plan",
    amount: 7600000, // ₦76,000 (converted from $49)
    duration: 365,
    description: "12 months of personalized fitness and meal plans"
  }
];

export type SubscriptionStatus = {
  active: boolean;
  plan?: SubscriptionPlan;
  expiresAt?: string;
};

type PaymentContextType = {
  subscription: SubscriptionStatus;
  loading: boolean;
  error: string | null;
  plans: SubscriptionPlan[];
  initiatePayment: (plan: SubscriptionPlan) => Promise<void>;
  verifyPayment: (reference: string) => Promise<boolean>;
  checkSubscription: () => Promise<SubscriptionStatus>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    active: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, this would make a call to Paystack API
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
      
      // Normally, we would make an API call to our backend to initialize the transaction
      // The backend would use the secret key to create a transaction
      // For this mock, we'll simulate the flow with the PaystackPop library
      
      // @ts-ignore - The PaystackPop is loaded via a script tag
      if (!window.PaystackPop) {
        throw new Error("Paystack not available. Please check your internet connection.");
      }
      
      // @ts-ignore
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: user.email,
        amount: plan.amount, // in kobo
        currency: 'NGN',
        ref: `fitpath_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        callback: (response: any) => {
          // This would normally call our backend to verify the transaction
          verifyPayment(response.reference)
            .then((success) => {
              if (success) {
                // Mock successful payment
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + plan.duration);
                
                const newSubscription: SubscriptionStatus = {
                  active: true,
                  plan,
                  expiresAt: expiryDate.toISOString()
                };
                
                setSubscription(newSubscription);
                localStorage.setItem(`fitpath-subscription-${user.id}`, JSON.stringify(newSubscription));
              }
            });
        },
        onClose: () => {
          // Handle case when user closes payment modal
          console.log("Payment window closed");
        }
      });
      
      handler.openIframe();
    } catch (err: any) {
      setError(err.message);
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
      // which would then verify the transaction with Paystack
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
      // In a real implementation, this would call your backend API
      // For this mock, we'll check localStorage
      const storedSubscription = localStorage.getItem(`fitpath-subscription-${user.id}`);
      
      if (storedSubscription) {
        const parsedSubscription: SubscriptionStatus = JSON.parse(storedSubscription);
        
        // Check if subscription has expired
        if (parsedSubscription.expiresAt) {
          const expiryDate = new Date(parsedSubscription.expiresAt);
          const now = new Date();
          
          if (expiryDate < now) {
            // Subscription has expired
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

  return (
    <PaymentContext.Provider
      value={{
        subscription,
        loading,
        error,
        plans: SUBSCRIPTION_PLANS,
        initiatePayment,
        verifyPayment,
        checkSubscription
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
