import React from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  User,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../../hooks/useAppState';
import { getUserRole, hasPermission } from '../../utils/supabase/client';

interface UserProfileMenuProps {
  userProfile: UserProfile | null;
  onSignOut?: () => void;
  onNavigateToDashboard?: () => void;
  compact?: boolean;
}

export function UserProfileMenu({
  userProfile,
  onSignOut,
  onNavigateToDashboard,
  compact = false,
}: UserProfileMenuProps) {
  if (!userProfile) return null;

  // Get user role and permissions
  const userRole = getUserRole({ user_metadata: userProfile });
  const canManageSettings = hasPermission(
    { user_metadata: userProfile },
    'canManageSettings'
  );
  const canViewDashboard = hasPermission(
    { user_metadata: userProfile },
    'canView'
  );

  // Get user initials for avatar
  const getInitials = (name: string) => {
    const parts = name?.split(' ') || ['User'];
    return parts
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Staff':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Client':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 px-3 py-2 rounded-lg"
        >
          <Avatar className="h-8 w-8 border-2 border-emerald-200">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-amber-500 text-white font-semibold text-sm">
              {getInitials(userProfile.name || userProfile.email)}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {userProfile.name || userProfile.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">
                  {userProfile.department || userRole}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2">
        {/* User Info Header */}
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-emerald-200">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-amber-500 text-white font-semibold">
                {getInitials(userProfile.name || userProfile.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm">
                {userProfile.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile.email}
              </p>
              <Badge
                className={`mt-1 text-[10px] px-2 py-0.5 ${getRoleBadgeColor(userRole)}`}
                variant="outline"
              >
                <Shield className="h-3 w-3 mr-1" />
                {userRole}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Department Info */}
        {userProfile.department && (
          <>
            <DropdownMenuItem className="text-xs text-gray-600 focus:bg-gray-50 cursor-default">
              <User className="mr-2 h-3 w-3" />
              <span className="truncate">{userProfile.department}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Dashboard Access - Only if user has view permission */}
        {canViewDashboard && onNavigateToDashboard && (
          <DropdownMenuItem
            onClick={onNavigateToDashboard}
            className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-900"
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>Dashboard Access</span>
            {(userRole === 'Admin' || userRole === 'Staff') && (
              <Badge variant="outline" className="ml-auto text-[10px]">
                {userRole}
              </Badge>
            )}
          </DropdownMenuItem>
        )}

        {/* Settings - Only for users with manage settings permission */}
        {canManageSettings && (
          <DropdownMenuItem className="cursor-pointer focus:bg-gray-50">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>

        {/* Permission Info (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 text-[10px] text-gray-500">
              <p className="font-medium mb-1">Permissions:</p>
              <div className="space-y-0.5">
                <p>View: {canViewDashboard ? '✓' : '✗'}</p>
                <p>
                  Edit:{' '}
                  {hasPermission({ user_metadata: userProfile }, 'canEdit')
                    ? '✓'
                    : '✗'}
                </p>
                <p>
                  Delete:{' '}
                  {hasPermission({ user_metadata: userProfile }, 'canDelete')
                    ? '✓'
                    : '✗'}
                </p>
                <p>Manage: {canManageSettings ? '✓' : '✗'}</p>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
