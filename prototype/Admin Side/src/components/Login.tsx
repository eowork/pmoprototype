import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  X, 
  Eye, 
  EyeOff, 
  LogIn, 
  User, 
  Lock, 
  Info,
  Users,
  Shield,
  UserCheck
} from 'lucide-react';
import { getDemoCredentials } from '../utils/supabase/client';

interface LoginProps {
  onClose: () => void;
  onSuccess: () => void;
  onSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  demoMode?: boolean;
}

export function Login({ onClose, onSuccess, onSignIn, demoMode = false }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const demoCredentials = demoMode ? getDemoCredentials() : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await onSignIn(email, password);
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Staff':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Client':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return Shield;
      case 'Staff':
        return UserCheck;
      case 'Client':
        return User;
      default:
        return User;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <LogIn className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Sign In</CardTitle>
              <CardDescription>
                {demoMode ? 'Demo Mode - Access all features' : 'Access your PMO Dashboard account'}
              </CardDescription>
            </div>
          </div>

          {demoMode && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Demo Mode Active</strong>
                <br />
                All authentication features are available for demonstration. Use the demo accounts below or enter any credentials.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Demo Accounts Section */}
          {demoMode && demoCredentials.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Quick Demo Login</Label>
              </div>
              
              <div className="grid gap-2">
                {demoCredentials.map((cred, index) => {
                  const IconComponent = getRoleIcon(cred.role);
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start gap-3 h-auto p-3"
                      onClick={() => handleDemoLogin(cred.email, cred.password)}
                    >
                      <IconComponent className="w-4 h-4" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{cred.name}</span>
                          <Badge variant="secondary" className={getRoleColor(cred.role)}>
                            {cred.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{cred.email}</p>
                      </div>
                    </Button>
                  );
                })}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or enter manually
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={demoMode ? "Try: admin@csu.edu.ph" : "Enter your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={demoMode ? "Try: demo123" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="whitespace-pre-line">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Demo Mode Info */}
          {demoMode && (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Role Capabilities:</h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-red-600" />
                    <span><strong>Admin:</strong> Full system access, user management, all CRUD operations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3 h-3 text-blue-600" />
                    <span><strong>Staff:</strong> Project creation/editing, content management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-green-600" />
                    <span><strong>Client:</strong> View-only access to all project information</span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                Demo mode provides full feature access for testing and demonstration purposes
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}