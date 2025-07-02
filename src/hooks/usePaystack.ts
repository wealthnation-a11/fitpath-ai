import { useState } from "react";
import { PAYSTACK_PUBLIC_KEY } from "@/utils/env";
import { SubscriptionPlan } from "@/types/payment";
import { PaymentService } from "@/services/paymentService";
import { toast } from "sonner";

export const usePaystack = (user: any, session: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPaystackScript = async (): Promise<void> => {
    if (typeof window.PaystackPop !== 'undefined') {
      return;
    }

    console.log("Loading Paystack script...");
    
    const existingScript = document.querySelector('script[src*="paystack"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);
    
    return new Promise((resolve, reject) => {
      script.onload = () => {
        console.log("Paystack script loaded successfully");
        resolve();
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
  };

  const initiatePayment = async (
    plan: SubscriptionPlan,
    onSuccess: (plan: SubscriptionPlan, expiryDate: string) => void
  ): Promise<void> => {
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

    console.log("Starting payment initiation for plan:", plan.name);
    setLoading(true);
    setError(null);
    
    try {
      if (!PAYSTACK_PUBLIC_KEY) {
        throw new Error("Payment system not configured. Please contact support.");
      }
      
      if (!PAYSTACK_PUBLIC_KEY.startsWith('pk_')) {
        throw new Error("Invalid Paystack public key format");
      }
      
      await loadPaystackScript();
      
      if (typeof window.PaystackPop === 'undefined') {
        throw new Error('Payment system failed to initialize. Please refresh and try again.');
      }
      
      const reference = `fitpath_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      console.log("Generated payment reference:", reference);
      
      // Define callback functions outside the setup to ensure they're valid
      const paymentSuccessCallback = (response: any) => {
        console.log("Payment success callback triggered:", response);
        
        if (response.status === 'success' && response.reference) {
          console.log("Payment successful, verifying transaction");
          
          PaymentService.verifyPayment(response.reference)
            .then((verified) => {
              if (verified) {
                console.log("Payment verified, upgrading user");
                return PaymentService.upgradeUser(plan, response.reference, user, session);
              } else {
                console.error("Payment verification failed");
                toast.error("Payment verification failed. Please contact support.");
                setLoading(false);
                return Promise.reject(new Error("Payment verification failed"));
              }
            })
            .then(() => {
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + plan.duration);
              
              onSuccess(plan, expiryDate.toISOString());
              setLoading(false);
              
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            })
            .catch((err) => {
              console.error("Error in payment success handler:", err);
              toast.error("Payment processing error. Please contact support.");
              setLoading(false);
            });
        } else {
          console.log("Payment not successful:", response);
          toast.error("Payment was not successful. Please try again.");
          setLoading(false);
        }
      };

      const paymentCloseCallback = () => {
        console.log("Payment popup closed by user");
        setLoading(false);
        PaymentService.showCancelMessage();
      };
      
      console.log("Opening Paystack popup with config:", {
        key: PAYSTACK_PUBLIC_KEY.substring(0, 10) + "...",
        email: user.email,
        amount: plan.amount,
        currency: 'NGN',
        ref: reference
      });
      
      // Ensure all required fields are present and valid
      const config = {
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email || '',
        amount: plan.amount,
        currency: 'NGN',
        ref: reference,
        callback: paymentSuccessCallback,
        onClose: paymentCloseCallback
      };
      
      // Validate config before passing to Paystack
      if (!config.key || !config.email || !config.amount || typeof config.callback !== 'function') {
        throw new Error('Invalid payment configuration');
      }
      
      const handler = window.PaystackPop.setup(config);
      
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

  const resetPaymentState = () => {
    setLoading(false);
    setError(null);
  };

  return {
    loading,
    error,
    initiatePayment,
    resetPaymentState
  };
};