// Common types for client-side components

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  avatar?: string;
  [key: string]: any;
}

export interface NavigationProps {
  onNavigate?: (page: string, section?: string) => void;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onNavigateToDashboard?: () => void;
  userRole?: string;
  userProfile?: UserProfile | null;
  requireAuth?: (action: string) => boolean;
  onAuthModalSignIn?: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  demoMode?: boolean;
}

export interface EditableSection {
  id: string;
  title: string;
  content: string;
  editable: boolean;
}

export interface GalleryImage {
  id: string;
  src: string;
  title: string;
  description: string;
  uploadedAt?: Date;
  uploadedBy?: string;
}

export interface CoreValue {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'emerald' | 'purple' | 'orange' | 'amber';
}

export interface Objective {
  id: string;
  category: 'strategic' | 'performance';
  title: string;
  description: string;
  target?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface ProjectCategory {
  id: string;
  name: string;
  count: number;
  color: 'emerald' | 'blue' | 'amber' | 'purple';
  description?: string;
}

export interface TeamStat {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

export interface ContactInfo {
  type: 'address' | 'phone' | 'email';
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Navigation section types
export interface NavigationSubsection {
  title: string;
  section: string;
}

export interface NavigationSection {
  category: string;
  page: string;
  icon: React.ComponentType<{ className?: string }>;
  subsections: NavigationSubsection[];
}

export interface NavigationCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  sections: NavigationSection[];
}

// Common utility types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoadingState {
  loading: boolean;
  error?: string | null;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

// Event handler types
export type NavigationHandler = (page: string, section?: string) => void;
export type AuthenticationHandler = (email: string, password: string) => Promise<ApiResponse>;
export type VoidHandler = () => void;
export type StringHandler = (value: string) => void;
export type BooleanHandler = (value: boolean) => void;