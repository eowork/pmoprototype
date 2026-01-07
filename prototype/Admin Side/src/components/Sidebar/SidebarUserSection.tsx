import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User, LogOut, LogIn } from 'lucide-react';
import { getRoleColor } from '../constants/sidebarConfig';
import { cn } from '../ui/utils';

interface SidebarUserSectionProps {
  isLoggedIn: boolean;
  userProfile: any;
  collapsed: boolean;
  onSignOut: () => void;
  onLoginClick: () => void;
}

export function SidebarUserSection({
  isLoggedIn,
  userProfile,
  collapsed,
  onSignOut,
  onLoginClick
}: SidebarUserSectionProps) {
  return (
    <div className="sidebar-user-section">
      {isLoggedIn && userProfile ? (
        <div className="p-4 space-y-3">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-700 text-white text-sm font-semibold">
                  {userProfile.name?.charAt(0) || <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate sidebar-primary-text">{userProfile.name}</p>
                <Badge variant="secondary" className={cn("text-xs", getRoleColor(userProfile.role))}>
                  {userProfile.role}
                </Badge>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className={cn(
              "w-full justify-center gap-2 text-xs font-medium border-gray-300 hover:bg-gray-100 sidebar-transition",
              collapsed && "px-2"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      ) : (
        <div className="p-4">
          <Button
            size="sm"
            onClick={onLoginClick}
            className={cn(
              "w-full justify-center gap-2 text-xs font-medium bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-primary sidebar-transition",
              collapsed && "px-2"
            )}
          >
            <LogIn className="w-4 h-4" />
            {!collapsed && <span>Sign In</span>}
          </Button>
        </div>
      )}
    </div>
  );
}