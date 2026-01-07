import { useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

interface UseNavigationSideEffectsProps {
  currentPage: string;
  userProfile: any;
  onShowLogin: () => void;
  onNavigate: (page: string) => void;
}

export const useNavigationSideEffects = ({
  currentPage,
  userProfile,
  onShowLogin,
  onNavigate,
}: UseNavigationSideEffectsProps) => {
  
  useEffect(() => {
    // Handle admin-only routes
    if (currentPage === 'users') {
      if (!userProfile) {
        onShowLogin();
        return;
      }
      if (userProfile.role !== 'Admin') {
        toast.error('Access denied. Admin privileges required.');
        onNavigate('overview');
        return;
      }
    }

    // Handle settings route (requires any authenticated user)
    if (currentPage === 'settings') {
      if (!userProfile) {
        onShowLogin();
        return;
      }
    }
  }, [currentPage, userProfile, onShowLogin, onNavigate]);

  // Helper function to check if user has access to a route
  const hasRouteAccess = (requiredRole?: string) => {
    if (!userProfile) return false;
    
    if (!requiredRole) return true; // No role required
    
    const roleHierarchy = {
      'Client': 0,
      'Staff': 1,
      'Manager': 2,
      'Admin': 3
    };
    
    const userLevel = roleHierarchy[userProfile.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 1;
    
    return userLevel >= requiredLevel;
  };

  return { hasRouteAccess };
};