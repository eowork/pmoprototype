import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, getCurrentUser, isDemoMode, getDemoCredentials } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'Client' | 'Staff' | 'Manager' | 'Admin';
  department: string;
  status: string;
  avatar: string;
}

export interface AppState {
  currentPage: string;
  selectedProject: any;
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  showLogin: boolean;
  showOnboarding: boolean;
  filterData: any;
  sidebarCollapsed: boolean;
  authError: string | null;
  isMobile: boolean;
  demoMode: boolean;
  showClientLanding: boolean;
  currentSection?: string; // Add currentSection to track About Us subsections
}

export const useAppState = () => {
  const [state, setState] = useState<AppState>({
    currentPage: 'home',
    selectedProject: null,
    user: null,
    userProfile: null,
    loading: true,
    showLogin: false,
    showOnboarding: false,
    filterData: null,
    sidebarCollapsed: false,
    authError: null,
    isMobile: false,
    demoMode: false,
    showClientLanding: true,
    currentSection: undefined,
  });

  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  // Optimized state update function
  const updateState = useCallback((updates: Partial<AppState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Enhanced mobile detection with error handling
  useEffect(() => {
    const checkMobile = () => {
      try {
        const mobile = window.innerWidth < 1024;
        if (mountedRef.current) {
          updateState({ 
            isMobile: mobile,
            sidebarCollapsed: mobile ? true : window.innerWidth >= 1280 ? false : state.sidebarCollapsed
          });
        }
      } catch (error) {
        console.error('Error in mobile detection:', error);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [updateState, state.sidebarCollapsed]);

  // Enhanced initialization with proper cleanup
  useEffect(() => {
    if (!initializingRef.current) {
      initializingRef.current = true;
      initializeApp();
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing app...');
      updateState({ authError: null });
      
      // Check if running in demo mode
      const isDemo = isDemoMode();
      updateState({ demoMode: isDemo });
      
      if (isDemo) {
        console.info('🎭 Running in Demo Mode');
        console.info('📚 Available demo accounts:', getDemoCredentials());
        
        // Check if user should see onboarding
        const hasSeenOnboarding = localStorage.getItem('csu_pmo_onboarding_completed');
        if (!hasSeenOnboarding) {
          updateState({ showOnboarding: true });
        }
        
        // Check for existing demo session
        try {
          const { user: demoUser } = await getCurrentUser();
          if (demoUser) {
            updateState({ user: demoUser });
            await loadUserProfile(demoUser);
          }
        } catch (error) {
          console.warn('Demo user check failed:', error);
        }
        
        updateState({ loading: false });
        return;
      }

      // Production Supabase initialization
      if (!supabase || !supabase.auth) {
        console.warn('Supabase client not available, running in demo mode');
        updateState({ demoMode: true, loading: false });
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Session check failed:', error.message);
        updateState({ authError: error.message });
      } else if (session?.user) {
        updateState({ user: session.user });
        await loadUserProfile(session.user);
      }
      
      // Check onboarding status
      const hasSeenOnboarding = localStorage.getItem('csu_pmo_onboarding_completed');
      if (!hasSeenOnboarding) {
        updateState({ showOnboarding: true });
      }
    } catch (error) {
      console.error('App initialization error:', error);
      updateState({ 
        authError: error.message || 'Failed to initialize authentication',
        demoMode: true // Fallback to demo mode
      });
    } finally {
      updateState({ loading: false });
      initializingRef.current = false;
    }
  };

  const loadUserProfile = async (user: any) => {
    try {
      const defaultProfile: UserProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        role: user.user_metadata?.role || 'Staff',
        department: user.user_metadata?.department || 'General',
        status: 'active',
        avatar: user.user_metadata?.avatar || ''
      };
      updateState({ userProfile: defaultProfile });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Enhanced RBAC function - pure function that doesn't trigger side effects during render
  const checkAdminAccess = useCallback((requiredRole = 'Staff') => {
    if (!state.user) {
      return false;
    }
    
    const userRole = state.userProfile?.role || 'Client';
    const roleHierarchy = {
      'Client': 0,
      'Staff': 1,
      'Manager': 2,
      'Admin': 3
    };
    
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 1;
    
    return userLevel >= requiredLevel;
  }, [state.user, state.userProfile]);

  // Separate function for requiring auth with side effects
  const checkAdminAccessWithSideEffects = useCallback((requiredRole = 'Staff') => {
    if (!state.user) {
      updateState({ showLogin: true });
      toast.error('Please sign in to access administrative features');
      return false;
    }
    
    const hasAccess = checkAdminAccess(requiredRole);
    
    if (!hasAccess) {
      toast.error(`Access denied. ${requiredRole} privileges required.`);
      return false;
    }
    
    return true;
  }, [state.user, checkAdminAccess, updateState]);

  // Enhanced require auth with role checking
  const requireAuth = useCallback((action: string, requiredRole = 'Staff') => {
    if (!state.user) {
      updateState({ showLogin: true });
      toast.error(`Please sign in to ${action}`);
      return false;
    }
    
    return checkAdminAccessWithSideEffects(requiredRole);
  }, [state.user, checkAdminAccessWithSideEffects, updateState]);

  // Optimized chart click handler
  const handleChartClick = useCallback((dataType: string, filters: any) => {
    try {
      console.log('Chart clicked:', dataType, filters);
      
      // Clear any existing filters first
      updateState({ filterData: null });
      
      if (dataType.includes('project') || dataType.includes('category')) {
        const category = filters.category || filters.name || 'construction';
        console.log('Navigating to category:', category);
        
        // Map category name to proper page identifier
        const categoryMap = {
          'Construction': 'construction',
          'Major Repairs': 'major-repairs',
          'Minor Repairs': 'minor-repairs',  
          'Fabrications': 'fabrications',
          'Internally Funded Research': 'internally-funded-research',
          'Externally Funded Research': 'externally-funded-research',
          'Extension Programs': 'extension-programs',
          'Gender & Development': 'gender-development',
          'University Operations': 'operational-projects',
          'Administrative Support': 'administrative-support'
        };
        
        const mappedCategory = categoryMap[category] || category.toLowerCase().replace(/\s+/g, '-');
        console.log('Mapped category:', mappedCategory);
        
        updateState({
          currentPage: mappedCategory,
          selectedProject: null,
          filterData: { 
            type: dataType, 
            filters: { 
              ...filters, 
              title: `${category} projects`,
              category: mappedCategory 
            } 
          }
        });
        
        toast.info(`Viewing ${category} projects`);
      }
    } catch (error) {
      console.error('Error handling chart click:', error);
      toast.error('Navigation failed');
    }
  }, [updateState]);

  // Enhanced page change handler
  const handlePageChange = useCallback((page: string) => {
    try {
      console.log('Page changing to:', page);
      updateState({
        currentPage: page,
        selectedProject: null,
        filterData: state.filterData?.filters?.category === page ? state.filterData : null
      });
    } catch (error) {
      console.error('Error changing page:', error);
      toast.error('Navigation failed');
    }
  }, [updateState, state.filterData]);

  const handleProjectSelect = useCallback((project: any) => {
    updateState({ selectedProject: project });
  }, [updateState]);

  const updateUserProfile = useCallback((updates: any) => {
    if (state.userProfile) {
      updateState({ userProfile: { ...state.userProfile, ...updates } });
    }
  }, [updateState, state.userProfile]);

  const clearFilters = useCallback(() => {
    updateState({ filterData: null });
    toast.success('Filters cleared');
  }, [updateState]);

  const handleOnboardingComplete = useCallback(() => {
    updateState({ showOnboarding: false });
    toast.success('Welcome to CSU PMO Dashboard! Explore the different categories to view projects.');
  }, [updateState]);

  const handleClientNavigation = useCallback((page: string, section?: string) => {
    console.log('Client navigation called:', { page, section });
    if (page === 'home') {
      updateState({ showClientLanding: true, currentPage: 'home', currentSection: undefined });
    } else {
      // Always keep client navigation in client context
      updateState({ showClientLanding: true });
      
      // For About Us pages, always navigate to client-about-us with the section info
      if (page === 'client-about-us') {
        // Map ClientNavbar section names to About Us page section names
        const sectionMap: Record<string, string> = {
          'personnel-org-chart': 'personnel',
          'office-objectives': 'pmo-mission',
          'pmo-contact-details': 'contact',
          'personnel': 'personnel',
          'pmo-mission': 'pmo-mission',
          'contact': 'contact',
          'overview': 'overview',
          'csu-identity': 'csu-identity'
        };
        
        const targetSection = sectionMap[section || 'overview'] || 'overview';
        console.log('Navigating to About Us with mapped section:', { originalSection: section, targetSection });
        
        // Store the section information for the About Us page to use
        updateState({ 
          currentPage: 'client-about-us',
          currentSection: targetSection
        });
      } 
      // For University Operations pages, always navigate to client-university-operations with the section info
      else if (page === 'client-university-operations') {
        const targetSection = section || 'overview';
        console.log('Navigating to University Operations with section:', targetSection);
        // Store the section information for the University Operations page to use
        updateState({ 
          currentPage: 'client-university-operations',
          currentSection: targetSection
        });
      } 
      // For Construction Infrastructure pages, always navigate to client-construction-infrastructure with the section info
      else if (page === 'client-construction-infrastructure') {
        const targetSection = section || 'overview';
        console.log('Navigating to Construction Infrastructure with section:', targetSection);
        // Store the section information for the Construction Infrastructure page to use
        updateState({ 
          currentPage: 'client-construction-infrastructure',
          currentSection: targetSection
        });
      }
      // For Construction Project Detail pages, navigate with the projectId as currentSection
      else if (page === 'client-construction-project-detail') {
        const projectId = section; // section parameter contains the projectId
        console.log('🚀 Navigating to Construction Project Detail with projectId:', projectId);
        updateState({ 
          currentPage: 'client-construction-project-detail',
          currentSection: projectId
        });
      } 
      // For Repairs pages, always navigate to client-repairs with the section info
      else if (page === 'client-repairs') {
        const targetSection = section || 'overview';
        console.log('Navigating to Repairs with section:', targetSection);
        // Store the section information for the Repairs page to use
        updateState({ 
          currentPage: 'client-repairs',
          currentSection: targetSection
        });
      } 
      // For GAD Parity pages, always navigate to client-gad-parity with the section info
      else if (page === 'client-gad-parity') {
        const targetSection = section || 'overview';
        console.log('Navigating to GAD Parity with section:', targetSection);
        // Store the section information for the GAD Parity page to use
        updateState({ 
          currentPage: 'client-gad-parity',
          currentSection: targetSection
        });
      } 
      // For Forms pages, always navigate to client-forms with the section info
      else if (page === 'client-forms') {
        const targetSection = section || 'overview';
        console.log('Navigating to Forms with section:', targetSection);
        // Store the section information for the Forms page to use
        updateState({ 
          currentPage: 'client-forms',
          currentSection: targetSection
        });
      } 
      // For Policies pages, always navigate to client-policies with the section info
      else if (page === 'client-policies') {
        const targetSection = section || 'overview';
        console.log('Navigating to Policies with section:', targetSection);
        // Store the section information for the Policies page to use
        updateState({ 
          currentPage: 'client-policies',
          currentSection: targetSection
        });
      } else {
        // For other client pages, update both showClientLanding and currentPage
        console.log('Navigating to other client page:', page);
        updateState({ currentPage: page, currentSection: undefined });
      }
    }
  }, [updateState]);

  const handleClientSignIn = useCallback(() => {
    updateState({ showClientLanding: false, showLogin: true });
  }, [updateState]);

  return {
    state,
    updateState,
    checkAdminAccess,
    checkAdminAccessWithSideEffects,
    requireAuth,
    handleChartClick,
    handlePageChange,
    handleProjectSelect,
    updateUserProfile,
    clearFilters,
    handleOnboardingComplete,
    handleClientNavigation,
    handleClientSignIn,
    loadUserProfile,
  };
};