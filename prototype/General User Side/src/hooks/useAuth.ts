import { useEffect, useCallback } from 'react';
import { supabase, signOut, signIn } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { UserProfile } from './useAppState';

interface UseAuthProps {
  user: any;
  userProfile: UserProfile | null;
  demoMode: boolean;
  updateState: (updates: any) => void;
  loadUserProfile: (user: any) => Promise<void>;
}

export const useAuth = ({ 
  user, 
  userProfile, 
  demoMode, 
  updateState, 
  loadUserProfile 
}: UseAuthProps) => {
  
  // Enhanced auth state change handling with cleanup
  useEffect(() => {
    if (demoMode || !supabase || !supabase.auth) {
      return;
    }

    let subscription;
    
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          updateState({ user: session.user });
          await loadUserProfile(session.user);
          updateState({ showLogin: false, authError: null });
          toast.success('Welcome! You now have access to privileged features.', { duration: 2000 });
        } else if (event === 'SIGNED_OUT') {
          updateState({
            user: null,
            userProfile: null,
            showClientLanding: true, // Show client landing page
            currentPage: 'home', // Navigate to home
            selectedProject: null,
            authError: null
          });
          toast.success('Successfully signed out. You can still view all data.', { duration: 2000 });
        }
      });
      
      subscription = data.subscription;
    } catch (error) {
      console.error('Auth listener setup failed:', error);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [demoMode, updateState, loadUserProfile]);

  // Enhanced sign out with proper error handling
  const handleSignOut = useCallback(async () => {
    try {
      console.log('Signing out...');
      const { error } = await signOut();
      if (error) {
        throw error;
      }
      
      // Clear local state and redirect to client homepage
      updateState({
        user: null,
        userProfile: null,
        showClientLanding: true, // Ensure we show the client landing page
        currentPage: 'home', // Set to home instead of overview
        selectedProject: null
      });
      
      toast.success(demoMode ? 'Successfully signed out (Demo Mode)' : 'Successfully signed out', { duration: 2000 });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error(`Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { duration: 2000 });
    }
  }, [updateState, demoMode]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      const { user: signedInUser, error } = await signIn(email, password);

      if (error) {
        return { success: false, error: error.message };
      }

      if (signedInUser) {
        updateState({ user: signedInUser });
        await loadUserProfile(signedInUser);
        toast.success(demoMode ? 'Demo login successful!' : 'Login successful!', { duration: 2000 });
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      };
    }
  }, [updateState, loadUserProfile, demoMode]);

  // Enhanced user update handler with error handling
  const handleUserUpdate = useCallback((updatedUser: {
    email?: string;
    id?: string;
    [key: string]: unknown;
  }) => {
    try {
      console.log('User updated from User Management:', updatedUser);
      
      // If the updated user is the current user, sync the profile
      if (userProfile && (updatedUser.email === userProfile.email || updatedUser.id === userProfile.id)) {
        updateState({
          userProfile: {
            ...userProfile,
            ...updatedUser
          }
        });
        toast.success('Your profile has been synchronized', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error handling user update:', error);
    }
  }, [userProfile, updateState]);

  return {
    handleSignOut,
    handleSignIn,
    handleUserUpdate,
  };
};