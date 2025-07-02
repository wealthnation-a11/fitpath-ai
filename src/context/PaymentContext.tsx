import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { SUPPORTED_CURRENCIES, SUBSCRIPTION_PLANS } from "@/constants/payment";
import { PaymentService } from "@/services/paymentService";
import { usePaystack } from "@/hooks/usePaystack";
import { PaymentContextType, SubscriptionStatus, Currency, SubscriptionPlan } from "@/types/payment";

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    active: false
  });
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES.NGN);

  const { loading, initiatePayment: paystackInitiatePayment, resetPaymentState } = usePaystack(user, session);

  const formatPrice = (amount: number): string => {
    const mainUnitAmount = amount / 100;
    return `${currency.symbol}${mainUnitAmount.toLocaleString('en-NG')}`;
  };

  const upgradeUser = async (plan: SubscriptionPlan, reference: string) => {
    await PaymentService.upgradeUser(plan, reference, user, session);
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration);
    
    const newSubscription: SubscriptionStatus = {
      active: true,
      plan,
      expiresAt: expiryDate.toISOString()
    };
    
    setSubscription(newSubscription);
  };

  const showCancelMessage = () => {
    PaymentService.showCancelMessage();
  };

  useEffect(() => {
    setCurrency(SUPPORTED_CURRENCIES.NGN);
  }, []);

  const plans = SUBSCRIPTION_PLANS.map(plan => ({
    ...plan,
    amount: plan.baseAmount
  }));

  const initiatePayment = async (plan: SubscriptionPlan) => {
    await paystackInitiatePayment(plan, (plan, expiryDate) => {
      setSubscription({
        active: true,
        plan,
        expiresAt: expiryDate
      });
    });
  };

  const verifyPayment = async (reference: string): Promise<boolean> => {
    return PaymentService.verifyPayment(reference);
  };

  const checkSubscription = async (): Promise<SubscriptionStatus> => {
    const subscriptionStatus = await PaymentService.checkSubscription(user, session);
    setSubscription(subscriptionStatus);
    return subscriptionStatus;
  };

  const startFreeTrial = () => {
    const trialSubscription = PaymentService.startFreeTrial(user);
    if (trialSubscription) {
      setSubscription(trialSubscription);
    }
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

// Re-export types and constants for backward compatibility
export type { Currency, SubscriptionPlan, SubscriptionStatus } from "@/types/payment";
export { SUBSCRIPTION_PLANS } from "@/constants/payment";
