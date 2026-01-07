import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Lightbulb, 
  Target, 
  Users,
  Building,
  BarChart3,
  Search,
  Settings,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  actionLabel?: string;
  actionType?: 'navigation' | 'next' | 'complete';
  navigationTarget?: string;
}

interface OnboardingHelperProps {
  userRole: string;
  onComplete: () => void;
  onNavigate: (page: string) => void;
}

export function OnboardingHelper({ userRole, onComplete, onNavigate }: OnboardingHelperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('csu_pmo_onboarding_completed');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  // Define handler functions first
  const handleComplete = () => {
    localStorage.setItem('csu_pmo_onboarding_completed', 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('csu_pmo_onboarding_completed', 'true');
    setIsVisible(false);
    onComplete();
  };

  const nextStep = () => {
    if (currentStep < getOnboardingSteps().length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = (step: OnboardingStep) => {
    if (step.actionType === 'navigation' && step.navigationTarget) {
      onNavigate(step.navigationTarget);
    } else if (step.actionType === 'complete') {
      handleComplete();
    } else if (step.actionType === 'next') {
      nextStep();
    }
  };

  // Now define the steps function with proper dependencies
  const getOnboardingSteps = (): OnboardingStep[] => {
    const baseSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to CSU PMO Dashboard',
        description: 'Your comprehensive project management and monitoring system',
        icon: Star,
        content: 'This dashboard provides real-time insights into all university projects across construction, research, extension programs, and administrative initiatives. Navigate through different categories to explore projects and their progress.',
        actionLabel: 'Start Tour',
        actionType: 'next'
      },
      {
        id: 'overview',
        title: 'Dashboard Overview',
        description: 'Get a bird\'s eye view of all university operations',
        icon: BarChart3,
        content: 'The Overview page shows key metrics, recent activities, and interactive charts. Click on any chart or category card to filter and navigate to specific project types. All data is updated in real-time.',
        actionLabel: 'Visit Overview',
        actionType: 'navigation',
        navigationTarget: 'overview'
      },
      {
        id: 'categories',
        title: 'Project Categories',
        description: 'Explore different types of university projects',
        icon: Building,
        content: 'Projects are organized into categories: Infrastructure (Construction, Repairs), Research & Extensions (Internal/External Research, Extension Programs), University Operations, and Gender & Development programs.',
        actionLabel: 'Browse Categories',
        actionType: 'navigation',
        navigationTarget: 'construction'
      },
      {
        id: 'search',
        title: 'Find Projects Quickly',
        description: 'Use powerful search and filtering tools',
        icon: Search,
        content: 'Each category page includes search functionality, status filters, and sorting options. You can quickly find specific projects by name, contractor, location, or status.',
      },
      {
        id: 'transparency',
        title: 'Transparency & Accountability',
        description: 'Open access to project information',
        icon: Target,
        content: 'The system prioritizes transparency - anyone can view project data, progress, and budgets without authentication. This ensures accountability and keeps the community informed about university developments.',
      }
    ];

    // Add role-specific steps
    if (userRole === 'Admin') {
      baseSteps.push({
        id: 'admin-features',
        title: 'Administrative Features',
        description: 'Full system management capabilities',
        icon: Settings,
        content: 'As an Admin, you have full access to create, edit, and delete projects. You can also manage users, access advanced analytics, and configure system settings.',
        actionLabel: 'User Management',
        actionType: 'navigation',
        navigationTarget: 'users'
      });
    } else if (userRole === 'Staff') {
      baseSteps.push({
        id: 'staff-features',
        title: 'Staff Capabilities',
        description: 'Project creation and management tools',
        icon: Users,
        content: 'As Staff, you can create new projects, update progress, upload documents and photos, and manage project details. You have edit access to keep project information current.',
        actionLabel: 'Settings',
        actionType: 'navigation',
        navigationTarget: 'settings'
      });
    } else {
      baseSteps.push({
        id: 'public-access',
        title: 'Public Access',
        description: 'Comprehensive view-only access',
        icon: BookOpen,
        content: 'You have full viewing access to all project information, analytics, and progress reports. This ensures transparency and allows community members to stay informed about university projects.'
      });
    }

    baseSteps.push({
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start exploring the PMO Dashboard',
      icon: CheckCircle,
      content: 'You now know the basics of navigating the system. Explore different categories, view project details, and use the interactive features to stay informed about CSU\'s development projects.',
      actionLabel: 'Complete Tutorial',
      actionType: 'complete'
    });

    return baseSteps;
  };

  const steps = getOnboardingSteps();
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-2 right-2 w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <currentStepData.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed">
              {currentStepData.content}
            </p>
          </div>

          {/* Role Badge */}
          <Alert className="border-blue-200 bg-blue-50">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Your Role: {userRole}</strong>
              <br />
              {userRole === 'Admin' && 'You have full administrative access to all system features and user management.'}
              {userRole === 'Staff' && 'You can create and edit projects, upload documents, and manage project information.'}
              {userRole === 'Client' && 'You have comprehensive view-only access to all project information and analytics.'}
            </AlertDescription>
          </Alert>

          {/* Quick Tips based on current step */}
          {currentStep === 1 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Quick Tips for Overview
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Click on category cards to navigate to specific project types</li>
                <li>• Use the tabs to view different analytics perspectives</li>
                <li>• Recent projects show the latest activity across all categories</li>
                <li>• All charts are interactive - click to filter and explore</li>
              </ul>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Category Organization
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <strong>Infrastructure:</strong> Construction, Major/Minor Repairs</li>
                <li>• <strong>Research:</strong> Internal/External funding, Extension programs</li>
                <li>• <strong>Operations:</strong> Administrative projects, IT systems</li>
                <li>• <strong>GAD:</strong> Gender and development initiatives</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStepData.actionLabel && (
                <Button
                  variant="outline"
                  onClick={() => handleAction(currentStepData)}
                  className="gap-2"
                >
                  {currentStepData.actionLabel}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep} className="gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} className="gap-2">
                  Get Started
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Skip Option */}
          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
              Skip tutorial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}