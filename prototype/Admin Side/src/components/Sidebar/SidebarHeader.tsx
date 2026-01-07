import React from 'react';
import { Building, Menu, X } from 'lucide-react';
import { cn } from '../ui/utils';

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarHeader({ collapsed, onToggleCollapse }: SidebarHeaderProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white",
      collapsed && "justify-center p-4"
    )}>
      {/* Toggle Button - Always visible */}
      {!collapsed && (
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
          title="Collapse sidebar"
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>
      )}
      
      {/* Logo/Dashboard Icon */}
      <div className={cn(
        "bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
        collapsed ? "w-8 h-8" : "w-8 h-8"
      )}>
        <Building className="w-5 h-5 text-white" />
      </div>
      
      {/* Title - Only when expanded */}
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-gray-900 leading-tight sidebar-primary-text">PMO Dashboard</h1>
          <p className="text-sm text-gray-600 leading-tight sidebar-secondary-text">Project Monitoring</p>
        </div>
      )}
      
      {/* Collapsed Toggle Button */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-200 rounded-md transition-colors"
          title="Expand sidebar"
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>
      )}
      
      {/* Mobile Close Button - Only on mobile when expanded */}
      {!collapsed && (
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-200 rounded-md lg:hidden ml-auto transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}