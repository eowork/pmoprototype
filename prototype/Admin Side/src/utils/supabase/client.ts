// Supabase client configuration with enhanced error handling and demo mode support
// Compatible with browser environments without process.env

import { DUMMY_ACCOUNTS, validateCredentials, type User } from '../../components/UserManagement/dummyAccounts';

// Environment variables with fallbacks for demo mode
// In production, these would be replaced with actual environment variables
const getEnvVar = (name: string, fallback: string = ''): string => {
  try {
    // Try to access environment variables if available
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name] || fallback;
    }
    
    // Fallback for browser environments
    // In a real deployment, you would use build-time environment variable injection
    return fallback;
  } catch (error) {
    console.warn(`Environment variable ${name} not accessible, using fallback`);
    return fallback;
  }
};

const supabaseUrl = getEnvVar('REACT_APP_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY');

// Enhanced client creation with error handling
let supabase: any = null;
let isSupabaseAvailable = false;

// Demo mode configuration - now integrated with DUMMY_ACCOUNTS
const DEMO_MODE = {
  enabled: !supabaseUrl || !supabaseAnonKey,
  users: DUMMY_ACCOUNTS // Use centralized dummy accounts
};

try {
  if (supabaseUrl && supabaseAnonKey) {
    // Try to import and initialize Supabase only if environment variables are available
    import('@supabase/supabase-js').then(({ createClient }) => {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      isSupabaseAvailable = true;
      console.log('Supabase client initialized successfully');
    }).catch(error => {
      console.warn('Failed to load Supabase client:', error);
      console.info('Running in demo mode - all authentication features available for demonstration');
    });
  } else {
    console.info('Supabase environment variables not found. Running in demo mode.');
    console.info('Demo credentials: admin@csu.edu.ph / demo123, staff@csu.edu.ph / demo123, client@csu.edu.ph / demo123');
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  console.info('Falling back to demo mode');
}

// Enhanced authentication functions with demo mode support
export const signOut = async () => {
  try {
    if (!isSupabaseAvailable || !supabase) {
      console.log('Sign out in demo mode');
      // Clear any demo session data
      localStorage.removeItem('demo_session');
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    if (!isSupabaseAvailable || !supabase) {
      // Check for demo session
      const demoSession = localStorage.getItem('demo_session');
      if (demoSession) {
        const sessionData = JSON.parse(demoSession);
        return { user: sessionData.user, error: null };
      }
      return { user: null, error: null };
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    return { user, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    if (!isSupabaseAvailable || !supabase) {
      console.log('Sign in attempted in demo mode');
      
      // Demo mode authentication using validateCredentials from DUMMY_ACCOUNTS
      const validatedUser = validateCredentials(email, password);
      
      if (validatedUser) {
        const sessionData = {
          user: {
            id: validatedUser.id,
            email: validatedUser.email,
            user_metadata: {
              name: validatedUser.name,
              role: validatedUser.role,
              department: validatedUser.department,
              position: validatedUser.position,
              phone: validatedUser.phone,
              allowedPages: validatedUser.allowedPages,
              description: validatedUser.description
            }
          },
          session: {
            access_token: 'demo_token',
            refresh_token: 'demo_refresh',
            expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
          }
        };
        
        // Store demo session
        localStorage.setItem('demo_session', JSON.stringify(sessionData));
        
        return { 
          user: sessionData.user, 
          error: null 
        };
      } else {
        return { 
          user: null, 
          error: { 
            message: `Invalid credentials. Please check your email and password, or use one of the ${DUMMY_ACCOUNTS.length} available demo accounts.` 
          } 
        };
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error };
  }
};

export const signUp = async (email: string, password: string, metadata?: any) => {
  try {
    if (!isSupabaseAvailable || !supabase) {
      console.log('Sign up attempted in demo mode');
      return { 
        user: null, 
        error: { 
          message: 'Sign up not available in demo mode. Use existing demo accounts:\n• admin@csu.edu.ph / demo123\n• staff@csu.edu.ph / demo123\n• client@csu.edu.ph / demo123' 
        } 
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error };
  }
};

// Enhanced session management
export const getSession = async () => {
  try {
    if (!isSupabaseAvailable || !supabase) {
      // Check for demo session
      const demoSession = localStorage.getItem('demo_session');
      if (demoSession) {
        const sessionData = JSON.parse(demoSession);
        // Check if session is expired
        if (sessionData.session.expires_at > Date.now()) {
          return { session: sessionData.session, error: null };
        } else {
          // Clear expired session
          localStorage.removeItem('demo_session');
        }
      }
      return { session: null, error: null };
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    return { session, error: null };
  } catch (error) {
    console.error('Get session error:', error);
    return { session: null, error };
  }
};

// Auth state change listener
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  try {
    if (!isSupabaseAvailable || !supabase) {
      console.log('Auth state change listener not available in demo mode');
      
      // Simulate auth state change for demo mode
      const checkDemoSession = () => {
        const demoSession = localStorage.getItem('demo_session');
        if (demoSession) {
          const sessionData = JSON.parse(demoSession);
          if (sessionData.session.expires_at > Date.now()) {
            callback('SIGNED_IN', sessionData.session);
          } else {
            localStorage.removeItem('demo_session');
            callback('SIGNED_OUT', null);
          }
        }
      };
      
      // Check immediately
      checkDemoSession();
      
      // Listen for storage changes (useful for multiple tabs)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'demo_session') {
          checkDemoSession();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {
              window.removeEventListener('storage', handleStorageChange);
            } 
          } 
        } 
      };
    }

    return supabase.auth.onAuthStateChange(callback);
  } catch (error) {
    console.error('Auth state change listener error:', error);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};

// Database helpers (for future use)
export const getProfile = async (userId: string) => {
  try {
    if (!isSupabaseAvailable || !supabase) {
      // Return demo profile data
      const demoSession = localStorage.getItem('demo_session');
      if (demoSession) {
        const sessionData = JSON.parse(demoSession);
        if (sessionData.user.id === userId) {
          return { 
            data: {
              id: sessionData.user.id,
              email: sessionData.user.email,
              name: sessionData.user.user_metadata.name,
              role: sessionData.user.user_metadata.role,
              department: sessionData.user.user_metadata.department,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, 
            error: null 
          };
        }
      }
      return { data: null, error: { message: 'Profile not found in demo mode' } };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Get profile error:', error);
    return { data: null, error };
  }
};

export const updateProfile = async (userId: string, updates: any) => {
  try {
    if (!isSupabaseAvailable || !supabase) {
      // Update demo profile data
      const demoSession = localStorage.getItem('demo_session');
      if (demoSession) {
        const sessionData = JSON.parse(demoSession);
        if (sessionData.user.id === userId) {
          // Update the stored session data
          sessionData.user.user_metadata = {
            ...sessionData.user.user_metadata,
            ...updates
          };
          localStorage.setItem('demo_session', JSON.stringify(sessionData));
          return { data: sessionData.user, error: null };
        }
      }
      return { data: null, error: { message: 'Cannot update profile in demo mode' } };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Update profile error:', error);
    return { data: null, error };
  }
};

// Utility functions
export const isDemoMode = () => DEMO_MODE.enabled || !isSupabaseAvailable;

export const getDemoCredentials = () => {
  // Return first 3 accounts (Admin, Admin, Staff) for quick login options
  return DEMO_MODE.users.slice(0, 3).map((user: User) => ({
    email: user.email,
    password: user.password,
    role: user.role,
    name: user.name
  }));
};

// Health check function
export const checkSupabaseConnection = async () => {
  try {
    if (!isSupabaseAvailable || !supabase) {
      return {
        status: 'demo',
        message: 'Running in demo mode',
        available: false
      };
    }

    // Try to make a simple request to check connection
    const { error } = await supabase.auth.getSession();
    return {
      status: error ? 'error' : 'connected',
      message: error ? error.message : 'Supabase connected successfully',
      available: !error
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Connection check failed',
      available: false
    };
  }
};

// Export the client for direct use if needed (will be null in demo mode)
export { supabase };
export default supabase;

// Export demo mode info for debugging
export const __DEMO_INFO__ = {
  isDemoMode: isDemoMode(),
  isSupabaseAvailable,
  credentials: getDemoCredentials()
};