import React, { useState, useEffect, useRef } from 'react';
import { supabase, getCurrentUser, signOut, isDemoMode, getDemoCredentials } from './utils/supabase/client';
import { ResponsiveSidebar as Sidebar } from './components/ResponsiveSidebar';
import { DashboardEnhanced as Dashboard } from './components/DashboardEnhanced';
import { CategoryPage } from './components/CategoryPage';
import { ProjectDetail } from './components/ProjectDetail';
import { UserManagement } from './components/UserManagementEnhanced';
import { AboutUsEnhanced as AboutUs } from './components/AboutUsEnhanced';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { LoadingSpinner } from './components/LoadingSpinner';
import { OnboardingHelper } from './components/OnboardingHelper';
import { ErrorBoundary } from './components/ErrorBoundary';
// University Operations category pages
import { HigherEducationProgramPage } from './components/university-operations/HigherEducationProgramPage';
import { AdvancedEducationProgramPage } from './components/university-operations/AdvancedEducationProgramPage';
import { ResearchProgramPage } from './components/university-operations/ResearchProgramPage';
import { TechnicalAdvisoryExtensionProgramPage } from './components/university-operations/TechnicalAdvisoryExtensionProgramPage';
// Facilities Assessment category pages
import { ClassroomAssessmentPage } from './components/classroom-administrative-offices/ClassroomAssessmentPage';
import { LaboratoryAssessmentPage } from './components/classroom-administrative-offices/LaboratoryAssessmentPage';
import { AdminOfficeAssessmentPage } from './components/classroom-administrative-offices/AdminOfficeAssessmentPage';
import { PrioritizationMatrixPage } from './components/classroom-administrative-offices/PrioritizationMatrixPage';
import { FacilitiesAssessmentOverview } from './components/classroom-administrative-offices/FacilitiesAssessmentOverview';
// Category overview pages
import { CategoryOverview as RepairsCategoryOverview } from './components/repairs-category/CategoryOverview';
import { MajorRepairsPage } from './components/repairs-category/MajorRepairsPage';
import { MinorRepairsPage } from './components/repairs-category/MinorRepairsPage';
import { ClassroomsRepairsPage } from './components/repairs-category/ClassroomsRepairsPage';
import { AdministrativeOfficesRepairsPage } from './components/repairs-category/AdministrativeOfficesRepairsPage';
import { CategoryOverview as UniversityOperationsCategoryOverview } from './components/university-operations/CategoryOverview';
import { CategoryOverview as ConstructionInfrastructureCategoryOverview } from './components/construction-infrastructure/CategoryOverview';
import { GADOverview as GADParityOverview } from './components/gad-parity-report/Overview';
// Forms pages
import { FormsOverview } from './components/forms/OverviewFixed';
import { FormsInventory } from './components/forms/FormsInventoryFixed';
import { EnhancedFormsOverview } from './components/forms/EnhancedFormsOverview';
import { EnhancedFormsInventory } from './components/forms/EnhancedFormsInventory';
import { ImprovedFormsOverview } from './components/forms/ImprovedFormsOverview';
import { ImprovedFormsInventory } from './components/forms/ImprovedFormsInventory';
// Policies pages
import { MinimalPoliciesOverview } from './components/policies/MinimalPoliciesOverview';
import { RefinedValidityPoliciesPage } from './components/policies/RefinedValidityPoliciesPage';
import { MinimalCategoryOverview } from './components/policies/MinimalCategoryOverview';
// GAD Parity pages
import { GenderParityReportPage } from './components/gad-parity-report/GenderParityReportPage';
import { GPBAccomplishmentsPage } from './components/gad-parity-report/GPBAccomplishmentsPage';
import { GADBudgetPlansPage } from './components/gad-parity-report/GADBudgetPlansPage';
// Repairs pages
import { RepairProjectDetail } from './components/repairs-category/RepairProjectDetail';
// Construction pages
import { GAA_FundedProjectsPage } from './components/construction-infrastructure/GAA-FundedProjectsPage';
import { LocallyFundedProjectsPage } from './components/construction-infrastructure/LocallyFundedProjectsPage';
import { SpecialGrantsProjectsPage } from './components/construction-infrastructure/SpecialGrantsProjectsPage';
import { ConstructionProjectDetail } from './components/construction-infrastructure/ConstructionProjectDetail';
import { LandingPage } from './components/client/LandingPage';
import { HomePage } from './components/client/homepage/HomePage';
import { GenderParityAnalysis } from './components/client/GenderParityAnalysis';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { categoryMapping, getCategoryPages } from './components/constants/sidebarConfig';
import './utils/suppressWarnings';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [filterData, setFilterData] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [showClientLanding, setShowClientLanding] = useState(true);

  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  // Enhanced mobile detection with error handling
  useEffect(() => {
    const checkMobile = () => {
      try {
        const mobile = window.innerWidth < 1024;
        if (mountedRef.current) {
          setIsMobile(mobile);
          
          // Smart sidebar behavior based on screen size
          if (mobile) {
            setSidebarCollapsed(true); // Always collapsed on mobile (overlay mode)
          } else if (window.innerWidth >= 1280) {
            setSidebarCollapsed(false); // Auto-expand on large screens
          }
          // Medium screens (1024-1279px) keep current state
        }
      } catch (error) {
        console.error('Error in mobile detection:', error);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
      setAuthError(null);
      
      // Check if running in demo mode
      const isDemo = isDemoMode();
      if (mountedRef.current) {
        setDemoMode(isDemo);
      }
      
      if (isDemo) {
        console.info('🎭 Running in Demo Mode');
        console.info('📚 Available demo accounts:', getDemoCredentials());
        
        // Check if user should see onboarding
        const hasSeenOnboarding = localStorage.getItem('csu_pmo_onboarding_completed');
        if (!hasSeenOnboarding && mountedRef.current) {
          setShowOnboarding(true);
        }
        
        // Check for existing demo session
        try {
          const { user: demoUser } = await getCurrentUser();
          if (demoUser && mountedRef.current) {
            setUser(demoUser);
            await loadUserProfile(demoUser);
          }
        } catch (error) {
          console.warn('Demo user check failed:', error);
        }
        
        if (mountedRef.current) {
          setLoading(false);
        }
        return;
      }

      // Production Supabase initialization
      if (!supabase || !supabase.auth) {
        console.warn('Supabase client not available, running in demo mode');
        if (mountedRef.current) {
          setDemoMode(true);
          setLoading(false);
        }
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Session check failed:', error.message);
        if (mountedRef.current) {
          setAuthError(error.message);
        }
      } else if (session?.user && mountedRef.current) {
        setUser(session.user);
        await loadUserProfile(session.user);
      }
      
      // Check onboarding status
      const hasSeenOnboarding = localStorage.getItem('csu_pmo_onboarding_completed');
      if (!hasSeenOnboarding && mountedRef.current) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('App initialization error:', error);
      if (mountedRef.current) {
        setAuthError(error.message || 'Failed to initialize authentication');
        setDemoMode(true); // Fallback to demo mode
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        initializingRef.current = false;
      }
    }
  };

  // Enhanced auth state change handling with cleanup
  useEffect(() => {
    if (demoMode || !supabase || !supabase.auth) {
      return;
    }

    let subscription;
    
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session);
        
        if (!mountedRef.current) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user);
          setShowLogin(false);
          setShowClientLanding(false); // Exit landing page on sign in
          setCurrentPage('overview'); // Navigate to dashboard overview after sign in
          setAuthError(null);
          toast.success('Welcome! You now have access to privileged features.');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          setCurrentPage('home'); // Redirect to home on sign out
          setSelectedProject(null);
          setFilterData(null);
          setShowClientLanding(true); // Show landing page after sign out
          setAuthError(null);
          toast.success('Successfully signed out. You are now viewing in public mode.', {
            description: 'You can still browse all public data without restrictions.'
          });
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
  }, [demoMode]);

  const loadUserProfile = async (user: any) => {
    try {
      const defaultProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        role: user.user_metadata?.role || 'Staff',
        department: user.user_metadata?.department || 'General',
        status: 'active',
        avatar: user.user_metadata?.avatar || '',
        allowedPages: user.user_metadata?.allowedPages || [], // Include allowedPages from user_metadata
        position: user.user_metadata?.position || '',
        phone: user.user_metadata?.phone || '',
        description: user.user_metadata?.description || ''
      };
      if (mountedRef.current) {
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Enhanced sign out with proper error handling
  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await signOut();
      if (error) {
        throw error;
      }
      
      // Clear local state and redirect to home page
      if (mountedRef.current) {
        setUser(null);
        setUserProfile(null);
        setCurrentPage('home'); // Redirect to home instead of overview
        setSelectedProject(null);
        setFilterData(null); // Clear any filters
        setShowClientLanding(true); // Show the client landing page
      }
      
      toast.success('Successfully signed out. You are now viewing in public mode.', {
        description: 'You can still browse all public data without restrictions.'
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error(`Sign out failed: ${error.message}`);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      // Dynamically import signIn function
      const { signIn: supabaseSignIn } = await import('./utils/supabase/client');
      const { user, error } = await supabaseSignIn(email, password);

      if (error) {
        return { success: false, error: error.message };
      }

      if (user && mountedRef.current) {
        setUser(user);
        await loadUserProfile(user);
        setShowClientLanding(false); // Exit landing page
        setCurrentPage('overview'); // Navigate to dashboard overview
        toast.success(demoMode ? 'Demo login successful!' : 'Login successful!');
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Sign in failed' };
    }
  };

  const requireAuth = (action: string) => {
    if (!user) {
      setShowLogin(true);
      toast.error(`Please sign in to ${action}`);
      return false;
    }
    return true;
  };

  // ============================================
  // RBAC Route Guard
  // ============================================
  
  /**
   * Check if user has access to a specific page
   * @param pageId - The page identifier to check
   * @returns boolean indicating if user has access
   */
  const hasAccessToPage = (pageId: string): boolean => {
    // Non-logged-in users can view all pages (public transparency)
    if (!user || !userProfile) {
      return true;
    }
    
    // Extract allowedPages from userProfile
    const allowedPages = userProfile.allowedPages || [];
    
    // Users without allowedPages configuration are blocked
    if (allowedPages.length === 0) {
      return false;
    }
    
    // Wildcard access (Admin/Client with full access)
    if (allowedPages.includes('*')) {
      return true;
    }
    
    // Check direct page access
    if (allowedPages.includes(pageId)) {
      return true;
    }
    
    // Public pages that everyone can access when logged in
    const publicPages = ['overview', 'home', 'about-us'];
    if (publicPages.includes(pageId)) {
      return true;
    }
    
    // Admin-only pages
    if (pageId === 'users' && userProfile.role === 'Admin') {
      return true;
    }
    
    // Settings accessible by all logged-in users
    if (pageId === 'settings' && user) {
      return true;
    }
    
    return false;
  };

  const handleChartClick = (dataType: string, filters: any) => {
    try {
      console.log('Chart clicked:', dataType, filters);
      
      // Clear any existing filters first
      setFilterData(null);
      
      if (dataType.includes('project') || dataType.includes('category')) {
        const category = filters.category || filters.name || 'construction';
        console.log('Navigating to category:', category);
        
        // Map category name to proper page identifier
        const categoryMap = {
          'Construction': 'construction',
          'Major Repairs': 'major-repairs',
          'Minor Repairs': 'minor-repairs',  
          'Internally Funded Research': 'internally-funded-research',
          'Externally Funded Research': 'externally-funded-research',
          'Extension Programs': 'extension-programs',
          'Gender & Development': 'gender-development',
          'University Operations': 'operational-projects',
          'Administrative Support': 'administrative-support'
        };
        
        const mappedCategory = categoryMap[category] || category.toLowerCase().replace(/\s+/g, '-');
        console.log('Mapped category:', mappedCategory);
        
        if (mountedRef.current) {
          setCurrentPage(mappedCategory);
          setSelectedProject(null);
          
          // Set filter data for the target page
          setFilterData({ 
            type: dataType, 
            filters: { 
              ...filters, 
              title: `${category} projects`,
              category: mappedCategory 
            } 
          });
        }
        
        toast.info(`Viewing ${category} projects`);
      }
    } catch (error) {
      console.error('Error handling chart click:', error);
      toast.error('Navigation failed');
    }
  };

  // Enhanced user update handler with error handling
  const handleUserUpdate = (updatedUser: any) => {
    try {
      console.log('User updated from User Management:', updatedUser);
      
      // If the updated user is the current user, sync the profile
      if (userProfile && (updatedUser.email === userProfile.email || updatedUser.id === userProfile.id)) {
        if (mountedRef.current) {
          setUserProfile(prevProfile => ({
            ...prevProfile,
            ...updatedUser
          }));
          toast.success('Your profile has been synchronized');
        }
      }
    } catch (error) {
      console.error('Error handling user update:', error);
    }
  };

  const clearFilters = () => {
    setFilterData(null);
    toast.success('Filters cleared');
  };

  // Enhanced page change handler with RBAC validation
  const handlePageChange = (page: string) => {
    try {
      console.log('Page changing to:', page);
      
      // Validate page access for logged-in users
      if (user && userProfile && !hasAccessToPage(page)) {
        toast.error('Access denied. You do not have permission to view this page.');
        console.warn(`Access denied to page: ${page} for user:`, userProfile.email);
        // Stay on current page
        return;
      }
      
      if (mountedRef.current) {
        setCurrentPage(page);
        setSelectedProject(null);
        // Only clear filters if we're not navigating from a chart click
        if (!filterData || filterData.filters?.category !== page) {
          setFilterData(null);
        }
      }
    } catch (error) {
      console.error('Error changing page:', error);
      toast.error('Navigation failed');
    }
  };

  const handleProjectSelect = (project: any) => {
    if (mountedRef.current) {
      setSelectedProject(project);
    }
  };

  const updateUserProfile = (updates: any) => {
    if (mountedRef.current && userProfile) {
      setUserProfile({ ...userProfile, ...updates });
    }
  };

  const handleOnboardingComplete = () => {
    if (mountedRef.current) {
      setShowOnboarding(false);
      toast.success('Welcome to CSU PMO Dashboard! Explore the different categories to view projects.');
    }
  };

  // Handle client landing page navigation
  const handleClientNavigation = (page: string) => {
    if (page === 'home') {
      setShowClientLanding(true);
      setCurrentPage('home');
    } else {
      setShowClientLanding(false);
      handlePageChange(page);
    }
  };

  const handleClientSignIn = () => {
    setShowClientLanding(false);
    setShowLogin(true);
  };

  // CRITICAL FIX: Enhanced render content with error handling
  const renderContent = () => {
    try {
      // Show client landing page if enabled
      if (showClientLanding) {
        return (
          <HomePage 
            onNavigate={handleClientNavigation}
            onSignIn={handleClientSignIn}
            userRole={userProfile?.role || 'Client'}
            requireAuth={requireAuth}
          />
        );
      }

      if (selectedProject) {
        // Check if this is a construction infrastructure project for special detail page
        const isConstructionInfrastructure = [
          'gaa-funded-projects', 
          'locally-funded-projects', 
          'special-grants-projects',
          'construction-of-infrastructure'
        ].includes(currentPage) || 
        (selectedProject.id && (
          selectedProject.id.startsWith('gaa-') || 
          selectedProject.id.startsWith('local-') || 
          selectedProject.id.startsWith('special-')
        )) ||
        (selectedProject.category && [
          'gaa-funded', 
          'locally-funded', 
          'special-grants'
        ].includes(selectedProject.category));

        // Check if this is a repair project for special detail page
        const isRepairProject = [
          'repairs', 
          'classrooms-csu-cc-bxu', 
          'administrative-offices-csu-cc-bxu'
        ].includes(currentPage) || 
        (selectedProject.id && (
          selectedProject.id.startsWith('main-') || 
          selectedProject.id.startsWith('bxu-')
        )) ||
        (selectedProject.campus && [
          'Main Campus', 
          'Cabadbaran Campus',
          'CSU',
          'BXU'
        ].includes(selectedProject.campus));
        
        if (isConstructionInfrastructure) {
          return (
            <ConstructionProjectDetail 
              project={selectedProject} 
              onBack={() => setSelectedProject(null)}
              onNavigate={handlePageChange}
              userRole={userProfile?.role || 'Client'}
              requireAuth={requireAuth}
            />
          );
        }

        if (isRepairProject) {
          return (
            <RepairProjectDetail 
              project={selectedProject} 
              onBack={() => setSelectedProject(null)}
              onNavigate={handlePageChange}
              userRole={userProfile?.role || 'Client'}
              requireAuth={requireAuth}
            />
          );
        }
        
        // Default project detail for other categories
        return (
          <ProjectDetail 
            project={selectedProject} 
            onBack={() => setSelectedProject(null)}
            onNavigate={handlePageChange}
            userRole={userProfile?.role || 'Client'}
            requireAuth={requireAuth}
          />
        );
      }

      switch (currentPage) {
        case 'overview':
          return (
            <Dashboard 
              userRole={userProfile?.role || 'Client'} 
              onChartClick={handleChartClick}
              requireAuth={requireAuth}
              filterData={filterData}
              onClearFilters={clearFilters}
              onProjectSelect={handleProjectSelect}
              onNavigate={handlePageChange}
              userProfile={userProfile}
            />
          );

        case 'about-us':
          return <AboutUs currentSection={null} userRole={userProfile?.role || 'Client'} />;

        case 'forms':
          return (
            <ImprovedFormsOverview 
              userRole={userProfile?.role || 'Client'}
              requireAuth={requireAuth}
              onNavigate={handlePageChange}
            />
          );

        case 'gad-parity-report':
        case 'gad-parity-knowledge-management':
          return (
            <GADParityOverview 
              userRole={userProfile?.role || 'Client'}
              requireAuth={requireAuth}
              onNavigate={handlePageChange}
            />
          );

        case 'client-gender-parity':
          return <GenderParityAnalysis />;

        case 'users':
          if (!user) {
            setShowLogin(true);
            return (
              <Dashboard 
                userRole={userProfile?.role || 'Client'} 
                onChartClick={handleChartClick}
                requireAuth={requireAuth}
                filterData={filterData}
                onClearFilters={clearFilters}
                onProjectSelect={handleProjectSelect}
                onNavigate={handlePageChange}
                userProfile={userProfile}
              />
            );
          }
          if (userProfile?.role !== 'Admin') {
            toast.error('Access denied. Admin privileges required.');
            setCurrentPage('overview');
            return (
              <Dashboard 
                userRole={userProfile?.role || 'Client'} 
                onChartClick={handleChartClick}
                requireAuth={requireAuth}
                filterData={filterData}
                onClearFilters={clearFilters}
                onProjectSelect={handleProjectSelect}
                onNavigate={handlePageChange}
                userProfile={userProfile}
              />
            );
          }
          return (
            <UserManagement 
              userRole={userProfile?.role || 'Client'} 
              onUserUpdate={handleUserUpdate}
              userProfile={userProfile}
            />
          );

        case 'settings':
          if (!user) {
            setShowLogin(true);
            return (
              <Dashboard 
                userRole={userProfile?.role || 'Client'} 
                onChartClick={handleChartClick}
                requireAuth={requireAuth}
                filterData={filterData}
                onClearFilters={clearFilters}
                onProjectSelect={handleProjectSelect}
                onNavigate={handlePageChange}
                userProfile={userProfile}
              />
            );
          }
          return (
            <Settings 
              userRole={userProfile?.role || 'Client'}
              userProfile={userProfile}
              onUpdateProfile={updateUserProfile}
            />
          );

        default:
          // Handle the expanded subcategories and their specific pages
          
          // About Us sub-pages (pass the specific section to About Us)
          if ([
            'personnel-org-chart', 'office-objectives', 'pmo-contact-details'
          ].includes(currentPage)) {
            return <AboutUs currentSection={currentPage} userRole={userProfile?.role || 'Client'} />;
          }

          // University Operations pages - Consolidated to use assessment-based overview
          if (currentPage === 'university-operations') {
            return (
              <UniversityOperationsCategoryOverview 
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
              />
            );
          }

          if (currentPage === 'higher-education-program') {
            return (
              <HigherEducationProgramPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
              />
            );
          }

          if (currentPage === 'advanced-education-program') {
            return (
              <AdvancedEducationProgramPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
              />
            );
          }

          if (currentPage === 'research-program') {
            return (
              <ResearchProgramPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
              />
            );
          }

          if (currentPage === 'technical-advisory-extension-program') {
            return (
              <TechnicalAdvisoryExtensionProgramPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
              />
            );
          }

          // Facilities Assessment pages (formerly Classroom and Administrative Offices)
          if (currentPage === 'facilities-assessment' || currentPage === 'facilities-assessment-overview') {
            return (
              <FacilitiesAssessmentOverview 
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
              />
            );
          }

          // Legacy routing support
          if (currentPage === 'classroom-administrative-offices' || currentPage === 'classroom-admin-overview') {
            return (
              <FacilitiesAssessmentOverview 
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
              />
            );
          }

          if (currentPage === 'classroom-csu-main-cc') {
            return (
              <ClassroomAssessmentPage 
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onProjectSelect={handleProjectSelect}
                filterData={filterData}
                onClearFilters={clearFilters}
                userProfile={userProfile}
              />
            );
          }

          if (currentPage === 'laboratory-assessment') {
            return (
              <LaboratoryAssessmentPage 
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onProjectSelect={handleProjectSelect}
                filterData={filterData}
                onClearFilters={clearFilters}
                userProfile={userProfile}
              />
            );
          }

          if (currentPage === 'admin-office-csu-main-cc') {
            return (
              <AdminOfficeAssessmentPage 
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onProjectSelect={handleProjectSelect}
                filterData={filterData}
                onClearFilters={clearFilters}
                userProfile={userProfile}
              />
            );
          }

          if (currentPage === 'prioritization-matrix') {
            return (
              <PrioritizationMatrixPage 
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onProjectSelect={handleProjectSelect}
                filterData={filterData}
                onClearFilters={clearFilters}
                userProfile={userProfile}
              />
            );
          }

          // Construction of Infrastructure pages
          if (currentPage === 'construction-of-infrastructure') {
            return (
              <ConstructionInfrastructureCategoryOverview 
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
                userDepartment={userProfile?.department || 'General'}
              />
            );
          }

          if (currentPage === 'construction-overview') {
            return (
              <ConstructionInfrastructureCategoryOverview 
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
                userDepartment={userProfile?.department || 'General'}
              />
            );
          }

          if (currentPage === 'gaa-funded-projects') {
            return (
              <GAA_FundedProjectsPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
                userDepartment={userProfile?.department || 'General'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
              />
            );
          }

          if (currentPage === 'locally-funded-projects') {
            return (
              <LocallyFundedProjectsPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
                userDepartment={userProfile?.department || 'General'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
              />
            );
          }

          if (currentPage === 'special-grants-projects') {
            return (
              <SpecialGrantsProjectsPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
                userDepartment={userProfile?.department || 'General'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
              />
            );
          }

          // Handle legacy construction page routing
          if (currentPage === 'construction') {
            return (
              <CategoryPage 
                category="construction"
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
              />
            );
          }

          // Repairs Main Category Overview
          if (currentPage === 'repairs') {
            return (
              <RepairsCategoryOverview 
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
                userDepartment={userProfile?.department || 'General'}
              />
            );
          }

          // Repairs subcategory pages
          if (currentPage === 'classrooms-csu-cc-bxu') {
            return (
              <ClassroomsRepairsPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
                userDepartment={userProfile?.department || 'General'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
              />
            );
          }

          if (currentPage === 'administrative-offices-csu-cc-bxu') {
            return (
              <AdministrativeOfficesRepairsPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
                userDepartment={userProfile?.department || 'General'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
              />
            );
          }

          // Policies pages - Minimal and validity-focused redesign
          if (currentPage === 'policies') {
            return (
              <MinimalCategoryOverview 
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
              />
            );
          }

          if (currentPage === 'policies-overview') {
            return (
              <MinimalPoliciesOverview 
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
              />
            );
          }

          if ([
            'memorandum-of-agreements', 'memorandum-of-understanding'
          ].includes(currentPage)) {
            return (
              <RefinedValidityPoliciesPage 
                category={currentPage}
                userRole={userProfile?.role || 'Client'}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
                requireAuth={requireAuth}
                onProjectSelect={handleProjectSelect}
                filterData={filterData}
                onClearFilters={clearFilters}
              />
            );
          }

          // GAD Parity Report pages - Enhanced with new subcategories
          if (currentPage === 'gad-overview') {
            return (
              <GADParityOverview 
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
              />
            );
          }

          if (currentPage === 'gender-parity-report') {
            return (
              <GenderParityReportPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
              />
            );
          }

          if (currentPage === 'gpb-accomplishment') {
            return (
              <GPBAccomplishmentsPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
              />
            );
          }

          if (currentPage === 'gad-budget-and-plans') {
            return (
              <GADBudgetPlansPage 
                category={currentPage}
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
              />
            );
          }

          // Downloadable Forms pages - Enhanced with new subcategories and tabs
          if (currentPage === 'forms-overview') {
            return (
              <EnhancedFormsOverview 
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
              />
            );
          }

          if (currentPage === 'forms-inventory') {
            return (
              <ImprovedFormsInventory 
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
              />
            );
          }

          // Legacy support for backward compatibility - map to University Operations overview
          if ([
            'operational-projects', 'administrative-support', 'university-operations-overview'
          ].includes(currentPage)) {
            return (
              <UniversityOperationsCategoryOverview 
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                requireAuth={requireAuth}
                onNavigate={handlePageChange}
                userEmail={userProfile?.email || 'user@carsu.edu.ph'}
              />
            );
          }

          if ([
            'infrastructure'
          ].includes(currentPage)) {
            return (
              <CategoryPage 
                category="construction"
                onProjectSelect={handleProjectSelect}
                userRole={userProfile?.role || 'Client'}
                filterData={filterData}
                requireAuth={requireAuth}
                onClearFilters={clearFilters}
              />
            );
          }

          // Default fallback to dashboard
          return (
            <Dashboard 
              userRole={userProfile?.role || 'Client'} 
              onChartClick={handleChartClick}
              requireAuth={requireAuth}
              filterData={filterData}
              onClearFilters={clearFilters}
              onProjectSelect={handleProjectSelect}
              onNavigate={handlePageChange}
              userProfile={userProfile}
            />
          );
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p>Something went wrong. Please refresh the page.</p>
            <button onClick={() => window.location.reload()}>Refresh</button>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('App Error Boundary:', error, errorInfo);
      // You can integrate with error reporting here
    }}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Only show auth errors that are not demo mode */}
        {authError && authError !== 'demo_mode' && (
          <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50 max-w-sm shadow-lg">
            <div className="flex">
              <div className="py-1">
                <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold">Connection Issue</p>
                <p className="text-sm">{authError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Responsive Sidebar - Hide when showing client landing */}
        {!showClientLanding && (
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={(page) => {
              if (page === 'home') {
                setShowClientLanding(true);
                setCurrentPage('home');
              } else {
                setShowClientLanding(false);
                handlePageChange(page);
              }
            }}
            userRole={userProfile?.role || 'Client'}
            userProfile={userProfile}
            onSignOut={handleSignOut}
            onLoginClick={() => {
              setShowClientLanding(false);
              setShowLogin(true);
            }}
            isLoggedIn={!!user}
            requireAuth={requireAuth}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
        
        {/* Main Content Area with responsive spacing */}
        <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${
          showClientLanding ? 'w-full' : `main-content-area ${
            isMobile ? 'main-content-mobile' : (sidebarCollapsed ? 'main-content-collapsed' : 'main-content-expanded')
          }`
        }`}>
          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            {renderContent()}
          </main>
        </div>
        
        {/* Enhanced Login Modal */}
        {showLogin && (
          <Login 
            onClose={() => setShowLogin(false)}
            onSuccess={() => setShowLogin(false)}
            onSignIn={handleSignIn}
            demoMode={demoMode}
          />
        )}

        {/* NEW: Onboarding Helper for new users */}
        {showOnboarding && (
          <OnboardingHelper
            userRole={userProfile?.role || 'Client'}
            onComplete={handleOnboardingComplete}
            onNavigate={handlePageChange}
          />
        )}

        {/* Enhanced Toast Notifications */}
        <Toaster 
          position="top-right"
          expand={true}
          richColors={true}
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            },
            className: 'text-sm',
            duration: 4000,
          }}
        />
      </div>
    </ErrorBoundary>
  );
}