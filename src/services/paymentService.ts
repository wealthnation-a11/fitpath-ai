import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan, SubscriptionStatus } from "@/types/payment";
import { SUBSCRIPTION_PLANS } from "@/constants/payment";
import { toast } from "sonner";

export class PaymentService {
  static async verifyPayment(reference: string): Promise<boolean> {
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
      return false;
    }
  }

  static async upgradeUser(
    plan: SubscriptionPlan, 
    reference: string, 
    user: any, 
    session: any
  ): Promise<void> {
    if (!user || !session) {
      throw new Error("User not authenticated");
    }

    console.log("Starting upgradeUser workflow for:", { planId: plan.id, reference });

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
  }

  static async checkSubscription(user: any, session: any): Promise<SubscriptionStatus> {
    if (!user || !session) {
      return { active: false };
    }
    
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
          const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscriber.subscription_tier);
          return {
            active: true,
            plan,
            expiresAt: subscriber.subscription_end
          };
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
            return {
              active: false,
              isTrialExpired: true
            };
          }
        }
        
        return parsedSubscription;
      }
      
      return { active: false };
    } catch (err: any) {
      console.error("Error checking subscription:", err);
      return { active: false };
    }
  }

  static startFreeTrial(user: any): SubscriptionStatus | null {
    if (!user) {
      toast.error("Please login to start a free trial");
      return null;
    }
    
    const trialPlan = SUBSCRIPTION_PLANS.find(p => p.id === "free-trial");
    if (!trialPlan) {
      toast.error("Free trial plan not found");
      return null;
    }
    
    const newTrialSubscription: SubscriptionStatus = {
      active: true,
      plan: trialPlan,
      trialStartDate: new Date().toISOString()
    };
    
    localStorage.setItem(`fitpath-subscription-${user.id}`, JSON.stringify(newTrialSubscription));
    toast.success("Free trial activated!");
    
    return newTrialSubscription;
  }

  static showCancelMessage(): void {
    toast.error("❌ Payment was cancelled. Try again anytime.");
    console.log("Payment cancelled by user");
  }
}