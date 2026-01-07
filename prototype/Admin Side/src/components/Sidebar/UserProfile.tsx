import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { 
  User, 
  LogOut, 
  LogIn, 
  Settings,
  ChevronDown,
  Shield,
  UserCheck
} from 'lucide-react';
import { getRoleColor } from '../constants/sidebarConfig';

interface UserProfileProps {
  userProfile: any;
  userRole: string;
  isLoggedIn: boolean;
  onSignOut: () => void;
  onLoginClick: () => void;
  onRoleChange: (role: string) => void;
  collapsed: boolean;
}

export function UserProfile({
  userProfile,
  userRole,
  isLoggedIn,
  onSignOut,
  onLoginClick,
  onRoleChange,
  collapsed
}: UserProfileProps) {
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  // REMOVED: Demo role changing functionality - this is now handled in User Management
  if (collapsed) {
    return (
      <div className="flex justify-center">
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userProfile?.avatar} />
                  <AvatarFallback className="text-xs">
                    {getInitials(userProfile?.name || userRole)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="sm" onClick={onLoginClick} className="w-10 h-10 p-0">
            <LogIn className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <div className="text-center">
          <Avatar className="w-12 h-12 mx-auto mb-2">
            <AvatarFallback>
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium">Guest User</p>
          <p className="text-xs text-muted-foreground">Limited access</p>
        </div>
        <Button onClick={onLoginClick} className="w-full gap-2" size="sm">
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(userRole);

  return (
    <div className="space-y-3">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={userProfile?.avatar} />
          <AvatarFallback className="text-sm">
            {getInitials(userProfile?.name || 'User')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {userProfile?.name || 'User'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {userProfile?.email}
          </p>
        </div>
      </div>

      {/* Role Badge - Display Only */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RoleIcon className="w-4 h-4" />
          <Badge variant="secondary" className={getRoleColor(userRole)}>
            {userRole}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Settings className="w-4 h-4" />
              Account
              <ChevronDown className="w-3 h-3 ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-48">
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* REMOVED: Demo role changing controls */}
    </div>
  );
}