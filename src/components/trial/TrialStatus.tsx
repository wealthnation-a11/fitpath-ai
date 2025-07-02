import { useAuth } from '@/context/AuthContext';
import { Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const TrialStatus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Since we removed payment system, this component is no longer needed
  // Returning null to maintain compatibility
  if (!user) {
    return null;
  }

  return null;
};