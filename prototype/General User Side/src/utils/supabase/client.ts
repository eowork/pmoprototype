/**
 * Supabase Client Stub for Client-Side PMO Dashboard
 * This file provides demo mode functionality for the client interface
 */

// Demo mode flag
const DEMO_MODE = true;

// RBAC Role Definitions with detailed permissions
export interface RolePermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canApprove: boolean;
  canExport: boolean;
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  Client: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
    canApprove: false,
    canExport: false,
  },
  Staff: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
    canApprove: false,
    canExport: true,
  },
  Admin: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canManageSettings: true,
    canApprove: true,
    canExport: true,
  },
};

// Demo user credentials for testing with RBAC
const DEMO_CREDENTIALS = [
  {
    email: 'client@carsu.edu.ph',
    password: 'demo123',
    role: 'Client',
    name: 'Client User',
    department: 'General Public',
    permissions: ROLE_PERMISSIONS.Client,
  },
  {
    email: 'staff@carsu.edu.ph',
    password: 'demo123',
    role: 'Staff',
    name: 'PMO Staff',
    department: 'Project Management Office',
    permissions: ROLE_PERMISSIONS.Staff,
  },
  {
    email: 'admin@carsu.edu.ph',
    password: 'demo123',
    role: 'Admin',
    name: 'PMO Administrator',
    department: 'Project Management Office',
    permissions: ROLE_PERMISSIONS.Admin,
  },
];

// Stub Supabase client
export const supabase = null;

/**
 * Check if running in demo mode
 */
export const isDemoMode = () => {
  return DEMO_MODE;
};

/**
 * Get demo credentials for display
 */
export const getDemoCredentials = () => {
  return DEMO_CREDENTIALS;
};

/**
 * Get current user (demo mode)
 */
export const getCurrentUser = async () => {
  // Check localStorage for demo session
  const demoSession = localStorage.getItem('csu_pmo_demo_session');
  
  if (demoSession) {
    try {
      const session = JSON.parse(demoSession);
      return { user: session.user, error: null };
    } catch (error) {
      console.error('Error parsing demo session:', error);
    }
  }
  
  return { user: null, error: null };
};

/**
 * Sign in with demo credentials
 */
export const signInWithDemo = async (email: string, password: string) => {
  const credential = DEMO_CREDENTIALS.find(
    c => c.email === email && c.password === password
  );
  
  if (!credential) {
    return {
      user: null,
      error: { message: 'Invalid credentials. Use one of the demo accounts.' }
    };
  }
  
  // Create demo user object with RBAC permissions
  const demoUser = {
    id: `demo-${credential.role.toLowerCase()}`,
    email: credential.email,
    user_metadata: {
      name: credential.name,
      role: credential.role,
      department: credential.department,
      permissions: credential.permissions,
      avatar: '',
    },
  };
  
  // Store in localStorage
  const demoSession = {
    user: demoUser,
    expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  
  localStorage.setItem('csu_pmo_demo_session', JSON.stringify(demoSession));
  
  return { user: demoUser, error: null };
};

/**
 * Sign in (alias for signInWithDemo)
 */
export const signIn = signInWithDemo;

/**
 * Sign in with Google (not supported in demo mode)
 */
export const signInWithGoogle = async () => {
  return {
    user: null,
    error: { message: 'Google sign-in is not available in demo mode. Please use email/password authentication.' }
  };
};

/**
 * Sign out (clear demo session)
 */
export const signOut = async () => {
  localStorage.removeItem('csu_pmo_demo_session');
  return { error: null };
};

/**
 * Get session (demo mode)
 */
export const getSession = async () => {
  const { user } = await getCurrentUser();
  
  if (user) {
    return {
      data: { session: { user } },
      error: null
    };
  }
  
  return {
    data: { session: null },
    error: null
  };
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  user: any,
  permission: keyof RolePermissions
): boolean => {
  if (!user || !user.user_metadata || !user.user_metadata.permissions) {
    // Default to Client permissions if no user
    return ROLE_PERMISSIONS.Client[permission];
  }
  
  const userPermissions = user.user_metadata.permissions;
  return userPermissions[permission] === true;
};

/**
 * Get user role
 */
export const getUserRole = (user: any): string => {
  if (!user || !user.user_metadata || !user.user_metadata.role) {
    return 'Client';
  }
  return user.user_metadata.role;
};

/**
 * Check if user is Admin
 */
export const isAdmin = (user: any): boolean => {
  return getUserRole(user) === 'Admin';
};

/**
 * Check if user is Staff or Admin
 */
export const isStaffOrAdmin = (user: any): boolean => {
  const role = getUserRole(user);
  return role === 'Staff' || role === 'Admin';
};
