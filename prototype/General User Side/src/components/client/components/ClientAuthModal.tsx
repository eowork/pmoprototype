import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Alert, AlertDescription } from "../../ui/alert";
import {
  X,
  Eye,
  EyeOff,
  LogIn,
  User,
  Lock,
  AlertCircle,
  CheckCircle2,
  Shield,
} from "lucide-react";
import {
  getDemoCredentials,
  signIn,
  signInWithGoogle,
} from "../../../utils/supabase/client";
import { toast } from "sonner@2.0.3";

interface ClientAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onSignIn?: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  demoMode?: boolean;
}

export function ClientAuthModal({
  onClose,
  onSuccess,
  onSignIn,
  demoMode = false,
}: ClientAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isValid, setIsValid] = useState({
    email: false,
    password: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const demoCredentials = demoMode ? getDemoCredentials() : [];

  // Real-time validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid({
      email: emailRegex.test(formData.email),
      password: formData.password.length >= 6,
    });
  }, [formData]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () =>
      document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (onSignIn) {
        const result = await onSignIn(
          formData.email,
          formData.password,
        );
        if (result.success) {
          toast.success("Welcome back! Access granted.", {
            duration: 2000,
          });
          onSuccess();
          onClose();
        } else {
          setError(
            result.error ||
              "Authentication failed. Please check your credentials.",
          );
        }
      } else {
        const { user, error: signInError } = await signIn(
          formData.email,
          formData.password,
        );

        if (signInError) {
          setError(signInError.message);
          return;
        }

        if (user) {
          toast.success("Welcome back! Access granted.", {
            duration: 2000,
          });
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { user, error: googleError } = await signInWithGoogle();

      if (googleError) {
        setError(googleError.message);
        return;
      }

      if (user) {
        toast.success(
          "Successfully authenticated with Google!",
          { duration: 2000 },
        );
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (
    demoEmail: string,
    demoPassword: string,
  ) => {
    setFormData({
      email: demoEmail,
      password: demoPassword,
    });
    setError("");
  };

  const isFormValid = isValid.email && isValid.password;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white overflow-hidden">
        {/* Compact Header */}
        <CardHeader className="relative p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 p-0 hover:bg-white/90 rounded-full transition-all"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                PMO Dashboard Access
              </CardTitle>
              <p className="text-xs text-gray-600">
                Sign in for privileged features
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Demo Account Quick Access - Improved Design */}
            {demoMode && demoCredentials.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Quick Access Demo Accounts
                  </Label>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                    Test Mode
                  </Badge>
                </div>
                <div className="grid gap-2">
                  {demoCredentials.map((cred, index) => {
                    const getRoleBadge = (role: string) => {
                      if (role === 'Admin') return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Shield };
                      if (role === 'Staff') return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: User };
                      return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: User };
                    };
                    const { color, icon: RoleIcon } = getRoleBadge(cred.role);
                    
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-between h-auto py-2.5 px-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-amber-50 hover:border-emerald-300 transition-all group"
                        onClick={() =>
                          handleDemoLogin(
                            cred.email,
                            cred.password,
                          )
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} transition-transform group-hover:scale-110`}>
                            <RoleIcon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900 text-xs leading-tight">
                              {cred.name}
                            </div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                              {cred.email}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0.5 ${color} font-medium`}>
                          {cred.role}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-2 text-gray-500 font-medium">
                      Or Sign In
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Compact Authentication Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              {/* Email Field - Compact */}
              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@carsu.edu.ph"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    className={`pl-8 pr-8 h-9 text-xs transition-all bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 ${
                      formData.email && !isValid.email
                        ? "border-red-300 focus:border-red-500 bg-red-50"
                        : formData.email && isValid.email
                          ? "border-emerald-300 focus:border-emerald-500 bg-emerald-50"
                          : ""
                    }`}
                    required
                    autoComplete="email"
                  />
                  {formData.email && (
                    <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                      {isValid.email ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Password Field - Compact */}
              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    className={`pl-8 pr-16 h-9 text-xs transition-all bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 ${
                      formData.password && !isValid.password
                        ? "border-red-300 focus:border-red-500 bg-red-50"
                        : formData.password &&
                            isValid.password
                          ? "border-emerald-300 focus:border-emerald-500 bg-emerald-50"
                          : ""
                    }`}
                    required
                    autoComplete="current-password"
                  />
                  <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {formData.password &&
                      (isValid.password ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-5 h-5 p-0 hover:bg-gray-100 rounded"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                {formData.password && !isValid.password && (
                  <p className="text-[10px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Min. 6 characters required
                  </p>
                )}
              </div>

              {/* Compact Sign In Button */}
              <Button
                type="submit"
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition-all text-xs mt-4"
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 mr-1.5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Compact Alternative Sign In */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">
                  Alternative
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-9 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-xs"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg
                className="w-4 h-4 mr-1.5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="border-red-200 bg-red-50 mt-3 py-2"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Compact Footer */}
          <div className="text-center pt-3 mt-3 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 text-xs hover:text-gray-700 hover:bg-gray-50 h-8 px-3"
            >
              Continue as Guest
            </Button>
            <p className="text-[10px] text-gray-500 mt-1.5">
              All project data is publicly accessible
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}