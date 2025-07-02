import { Currency, SubscriptionPlan } from "@/types/payment";

export const SUPPORTED_CURRENCIES: { [key: string]: Currency } = {
  USD: { code: "USD", symbol: "$", rate: 1 },
  NGN: { code: "NGN", symbol: "₦", rate: 1 },
  GBP: { code: "GBP", symbol: "£", rate: 0.79 },
  EUR: { code: "EUR", symbol: "€", rate: 0.92 },
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