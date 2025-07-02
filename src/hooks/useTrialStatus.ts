
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePlans } from '@/context/PlanContext';

export const useTrialStatus = () => {
  const { user } = useAuth();
  const { hasUsedFreeTrial } = usePlans();
  const [userHasUsedFreeTrial, setUserHasUsedFreeTrial] = useState(false);
  const [trialStatusLoading, setTrialStatusLoading] = useState(true);

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (user) {
        setTrialStatusLoading(true);
        try {
          const hasUsed = await hasUsedFreeTrial();
          setUserHasUsedFreeTrial(hasUsed);
        } catch (error) {
          console.error("Error checking trial status:", error);
          setUserHasUsedFreeTrial(false);
        } finally {
          setTrialStatusLoading(false);
        }
      }
    };

    checkTrialStatus();
  }, [user, hasUsedFreeTrial]);

  return { userHasUsedFreeTrial, trialStatusLoading };
};
