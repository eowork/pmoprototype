import React, { lazy, Suspense, memo } from 'react';

// CORE COMPONENTS
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';

// CUSTOM HOOKS
import { useAppState } from './hooks/useAppState';
import { useAuth } from './hooks/useAuth';

// CLIENT COMPONENTS - Optimized lazy loading for PMO Dashboard
const HomePage = lazy(() => import('./components/client/homepage/HomePage').then(module => ({ default: module.HomePage })));

// DESIGN FOUNDATION PAGES - Protected from modification as per requirements
const AboutUsPageEnhanced = lazy(() => import('./components/client/about-us/AboutUsPageEnhanced').then(module => ({ default: module.AboutUsPageEnhanced })));
const UniversityOperationsPage = lazy(() => import('./components/client/university-operations/UniversityOperationsPage').then(module => ({ default: module.UniversityOperationsPage })));
const ConstructionInfrastructurePage = lazy(() => import('./components/client/construction/ConstructionInfrastructurePage').then(module => ({ default: module.ConstructionInfrastructurePage })));
const ProjectDetailPage = lazy(() => import('./components/client/construction/ProjectDetailPageRestored').then(module => ({ default: module.ProjectDetailPageRestored })));

// PROJECT MANAGEMENT CATEGORY PAGES
const RepairsPageRestored = lazy(() => import('./components/client/repairs/RepairsPageRestored').then(module => ({ default: module.default })));
const RepairProjectDetailPage = lazy(() => import('./components/client/repairs/RepairProjectDetailPage').then(module => ({ default: module.default })));
const GADParityKnowledgeManagementPage = lazy(() => import('./components/client/gad-parity/GADParityKnowledgeManagementPage').then(module => ({ default: module.default })));
const ClientDownloadableFormsPage = lazy(() => import('./components/client/forms/ClientDownloadableFormsPage').then(module => ({ default: module.default })));
const ClientPoliciesPage = lazy(() => import('./components/client/policies/ClientPoliciesPage').then(module => ({ default: module.default })));
const ClassroomAdministrativeOfficePage = lazy(() => import('./components/client/class-admin-room/ClassroomAdministrativeOfficePage').then(module => ({ default: module.default })));

// UI COMPONENTS AND UTILITIES
import { Toaster } from './components/ui/sonner';
import { FloatingAccessibilityButton } from './components/client/components/FloatingAccessibilityButton';
import { initializeFontSize } from './hooks/useFontSize';
import { initializeTheme } from './hooks/useTheme';
import './utils/suppressWarnings';

export default function App() {
  // Initialize font size and theme on mount
  React.useEffect(() => {
    initializeFontSize();
    initializeTheme();
  }, []);
  // Use custom hooks for client-focused state management
  const {
    state,
    updateState,
    handlePageChange,
    handleProjectSelect,
    handleClientNavigation,
    handleClientSignIn,
    loadUserProfile,
  } = useAppState();

  const {
    handleSignOut,
    handleSignIn,
  } = useAuth({
    user: state.user,
    userProfile: state.userProfile,
    demoMode: state.demoMode,
    updateState,
    loadUserProfile,
  });

  // Optimized authentication handler for PMO Dashboard
  const handleAuthModalSignIn = React.useCallback(async (email: string, password: string) => {
    try {
      await handleSignIn(email, password);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      return { success: false, error: errorMessage };
    }
  }, [handleSignIn]);

  // Auth requirement checker for RBAC
  const requireAuth = React.useCallback((action: string): boolean => {
    if (!state.userProfile) {
      return false;
    }
    // Simple check: Admin and Staff can perform actions, Client cannot
    return ['Admin', 'Staff'].includes(state.userProfile.role);
  }, [state.userProfile]);

  // Common props for all pages to maintain consistency
  const commonPageProps = React.useMemo(() => ({
    onNavigate: handleClientNavigation || (() => {}),
    onSignIn: handleClientSignIn || (() => {}),
    onSignOut: handleSignOut || (() => {}),
    userRole: state?.userProfile?.role || 'Client',
    userProfile: state?.userProfile || null,
    requireAuth: requireAuth || (() => false),
    onAuthModalSignIn: handleAuthModalSignIn || (async () => ({ success: false })),
    demoMode: state?.demoMode || false,
  }), [
    handleClientNavigation,
    handleClientSignIn,
    handleSignOut,
    state.userProfile,
    requireAuth,
    handleAuthModalSignIn,
    state.demoMode,
  ]);

  // Optimized content rendering for PMO Dashboard
  const renderContent = () => {
    try {
      // Default home page - PMO Dashboard landing
      if (state.currentPage === 'home' || state.currentPage === 'client-home') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage {...commonPageProps} />
          </Suspense>
        );
      }

      // About Us page - Design foundation page (protected from modification)
      if (state.currentPage === 'client-about-us') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutUsPageEnhanced 
              {...commonPageProps}
              currentSection={state.currentSection || 'overview'}
            />
          </Suspense>
        );
      }

      // University Operations page - Design foundation page (protected from modification)
      if (state.currentPage === 'client-university-operations') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <UniversityOperationsPage 
              {...commonPageProps}
              currentSection={state.currentSection || 'overview'}
            />
          </Suspense>
        );
      }

      // Construction Infrastructure page - Design foundation page (protected from modification)
      if (state.currentPage === 'client-construction-infrastructure') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ConstructionInfrastructurePage 
              {...commonPageProps}
              currentSection={state.currentSection || 'overview'}
            />
          </Suspense>
        );
      }

      // Construction Project Detail page
      if (state.currentPage === 'client-construction-project-detail') {
        console.log('🎯 App.tsx - Rendering ProjectDetailPage with projectId:', state.currentSection);
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectDetailPage 
              {...commonPageProps}
              projectId={state.currentSection || ''}
            />
          </Suspense>
        );
      }

      // Repairs page - Project management category
      if (state.currentPage === 'client-repairs') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <RepairsPageRestored 
              {...commonPageProps}
              currentSection={state.currentSection || 'overview'}
            />
          </Suspense>
        );
      }

      // Repair Project Detail page
      if (state.currentPage === 'client-repair-project-detail') {
        console.log('🎯 App.tsx - Rendering RepairProjectDetailPage with projectId:', state.currentSection);
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <RepairProjectDetailPage 
              {...commonPageProps}
              projectId={state.currentSection || ''}
            />
          </Suspense>
        );
      }

      // GAD Parity and Knowledge Management page - Project management category
      if (state.currentPage === 'client-gad-parity') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <GADParityKnowledgeManagementPage 
              {...commonPageProps}
              currentSection={state.currentSection || 'overview'}
            />
          </Suspense>
        );
      }

      // Downloadable Forms page - Project management category
      if (state.currentPage === 'client-forms') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ClientDownloadableFormsPage 
              {...commonPageProps}
              currentSection={state.currentSection || 'overview'}
            />
          </Suspense>
        );
      }

      // Policies page - Project management category
      if (state.currentPage === 'client-policies') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ClientPoliciesPage 
              {...commonPageProps}
              currentSection={state.currentSection || 'overview'}
            />
          </Suspense>
        );
      }

      // Classroom & Administrative Office page - Project management category
      if (state.currentPage === 'client-class-admin-room') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ClassroomAdministrativeOfficePage 
              {...commonPageProps}
              currentSection={state.currentSection || 'overview'}
            />
          </Suspense>
        );
      }

      // Default fallback - redirect to PMO Dashboard home
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <HomePage {...commonPageProps} />
        </Suspense>
      );
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Something went wrong</h3>
            <p className="text-sm text-gray-600">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  };

  if (state.loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('App Error Boundary:', error, errorInfo);
    }}>
      <div className="min-h-screen bg-background">
        {/* Show connection issues if any */}
        {state.authError && state.authError !== 'demo_mode' && (
          <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50 max-w-sm shadow-lg">
            <div className="flex">
              <div className="py-1">
                <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold">Connection Issue</p>
                <p className="text-sm">{state.authError}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content - Full width for client-focused design */}
        <main className="w-full min-h-screen bg-background">
          {renderContent()}
        </main>

        {/* Toast Notifications */}
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
            duration: 2000,
          }}
        />

        {/* Floating Accessibility Button for Font Size Control */}
        <FloatingAccessibilityButton />
      </div>
    </ErrorBoundary>
  );
}